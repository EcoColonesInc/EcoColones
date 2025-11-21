import { createClient } from '@/utils/supabase/server'; 
import { TransactionTable } from "@/components/custom/affiliate/transactionTable";
import { PointsExchangeCards } from "@/components/custom/affiliate/dashredeemPoints";
import { DashProducts } from "@/components/custom/affiliate/dashProducts";
import { getAllCurrencies } from "@/lib/api/currencies";
import { getProductsByAffiliatedBusinessId } from "@/lib/api/products"; 
import { getBusinessByManagerId} from "@/lib/api/affiliatedbusiness"; 
import type { AffiliateTransaction } from '@/types/transactions';


// Tipo de datos que retorna getProductsByAffiliatedBusinessId (Datos brutos de DB)
type ProductData = {
    affiliated_business_x_prod: string;
    product_id: { product_id: string, product_name: string, description: string, state: string, image_url: string };
    affiliated_business_id: { affiliated_business_id: string, affiliated_business_name: string, description: string };
    product_price: number;
}

// NUEVO TIPO: Estructura esperada por el componente <DashProducts>
type Product = {
    // Correcto: Usamos 'string' para coincidir con el UUID de Supabase y DashProducts.tsx
    id: string; 
    imagen: string;
    titulo: string;
    descripcion: string;
    costo: number; 
};


/**
 * Formatea una cadena de fecha ISO a YYYY/MM/DD.
 * @param dateString La fecha en formato de cadena ISO.
 * @returns La fecha formateada o 'N/A'.
 */


export default async function Page() {
    
    // --- OBTENER EL ID DEL USUARIO DESDE LA SESIÓN DE SUPABASE ---
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    const userId: string | null = user?.id ?? null;
    // --------------------------------------------------------------

    let affiliatedBusinessId: string | null = null;
    let businessProducts: ProductData[] = [];
    let productsError: string | null = null;
    
    if (authError || !userId) {
        productsError = authError?.message || "El usuario no está autenticado. Por favor, inicia sesión.";
    } else {
        // PASO 1: Obtener el affiliated_business_id usando el userId (managerId)
        const { data: businessData, error: businessFetchError } = await getBusinessByManagerId(userId);

        if (businessFetchError) {
            productsError = `Error en DB al buscar ID de negocio: ${businessFetchError}`;
        } else if (businessData) {
             // Manejo de respuesta para asegurar la extracción del ID
            affiliatedBusinessId = Array.isArray(businessData) && businessData.length > 0
                ? businessData[0].affiliated_business_id
                : (businessData as { affiliated_business_id: string } | null)?.affiliated_business_id || null;
        } else {
            productsError = "No se encontró un negocio afiliado para el ID de usuario proporcionado.";
        }
    }

    // -------------------------------------------------------------------
    // --- LÓGICA DE TRANSACCIONES FILTRADAS POR ID DE NEGOCIO (USANDO RPC) ---
    // -------------------------------------------------------------------
    let allTransactions: AffiliateTransaction[] = [];
    let transactionsError: string | null = null;
    let monthlyTotal = 0; 
    
    if (affiliatedBusinessId) {
        // Llama directamente a Supabase RPC
        const { data: rawTransactions, error: fetchError } = await supabase.rpc(
            'get_transactions_by_affiliated_business_id',
            { p_affiliated_business_id: affiliatedBusinessId }
        );

        if (fetchError) {
            transactionsError = `Error al obtener transacciones: ${fetchError.message}`;
            console.error("Error al cargar transacciones del negocio:", transactionsError);
        } else if (rawTransactions) {
            // Mapear y transformar los datos al formato AffiliateTransaction
            allTransactions = rawTransactions.map((tx: any) => ({
                ab_transaction_id: tx.ab_transaction_id || '',
                person_id: {
                    user_name: tx.user_name || '',
                    first_name: tx.first_name || '',
                    last_name: tx.last_name || ''
                },
                affiliated_business_id: {
                    affiliated_business_name: tx.affiliated_business_name || ''
                },
                product_id: {
                    product_name: tx.product_names || tx.product_name || ''
                },
                currency: {
                    currency_name: tx.currency_name || 'CRC',
                    currency_exchange: tx.currency_exchange || 1
                },
                total_price: tx.total_price || 0,
                product_amount: tx.total_product_amount || tx.product_amount || 0,
                transaction_code: tx.transaction_code || '',
                state: tx.state || '',
                created_at: tx.created_at || ''
            }));
        }
    } else {
        // Si no hay ID de negocio, el error será el de autenticación/negocio no encontrado.
        transactionsError = productsError; 
    }
    
    let recentTransactions: AffiliateTransaction[] = [];

    // Cálculo del total mensual
    if (!transactionsError) {
        recentTransactions = allTransactions.slice(0, 10); // Mostrar solo las 10 más recientes
        monthlyTotal = allTransactions.reduce((sum, transaction) => {
            return sum + (transaction.total_price || 0);
        }, 0);
    }

    // -------------------------------------------------------------------
    // --- LÓGICA DE MONEDA ---
    const { data: currenciesData, error: currencyError } = await getAllCurrencies();
    let exchangeRate = 0.05;

    if (!currencyError && currenciesData) {
        const colonCurrency = currenciesData.find(c => c.currency_name === 'CRC'); 
        if (colonCurrency && colonCurrency.currency_exchange) {
            exchangeRate = colonCurrency.currency_exchange;
        }
    }

    // -------------------------------------------------------------------
    // --- LÓGICA PARA OBTENER PRODUCTOS DEL COMERCIO LOGUEADO ---
    // -------------------------------------------------------------------
    
    // Nueva variable para productos TRANSFORMADOS
    let transformedProducts: Product[] = [];

    if (affiliatedBusinessId) {
        // PASO 2: Usar la función existente con el ID obtenido
        const { data: productsData, error: productsFetchError } = await getProductsByAffiliatedBusinessId(affiliatedBusinessId);
        
        if (productsFetchError) {
            productsError = `Error al obtener productos: ${productsFetchError}`; 
        } else {
            businessProducts = (productsData as unknown as ProductData[] | null) || [];
            productsError = null;

            // PASO 3: Mapear los datos de la base de datos (ProductData) al tipo Product
            transformedProducts = businessProducts.map((item, index) => ({
                id: item.product_id?.product_id || `product-${index}`, // Fallback to index if ID is missing
                imagen: item.product_id?.image_url || '/productos/placeholder.png',
                titulo: item.product_id?.product_name || 'Producto sin nombre',
                descripcion: item.product_id?.description || '',
                costo: item.product_price || 0,
            }));
        }
    } else if (!productsError) {
        productsError = "El usuario logueado no está vinculado a un comercio afiliado.";
    }

    // -------------------------------------------------------------------
    // --- CONSULTAS: Estadísticas de Productos ---
    // -------------------------------------------------------------------
    
    // a) Listado de productos que ofrecen
    const totalProductsOffered = transformedProducts.length;
    
    // b) Top 5 de productos más canjeados
    const productRedemptionCounts = new Map<string, { name: string; count: number; points: number }>();
    
    allTransactions.forEach(tx => {
        const productName = tx.product_id?.product_name || '';
        const amount = tx.product_amount || 0;
        const price = tx.total_price || 0;
        
        if (productName) {
            const existing = productRedemptionCounts.get(productName);
            if (existing) {
                existing.count += amount;
                existing.points += price;
            } else {
                productRedemptionCounts.set(productName, { name: productName, count: amount, points: price });
            }
        }
    });
    
    const topProducts = Array.from(productRedemptionCounts.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    
    // c) Total de puntos canjeados en sus productos
    const totalPointsRedeemed = allTransactions.reduce((sum, tx) => sum + (tx.total_price || 0), 0);


    return (
        <div className="container mx-auto px-4 space-y-12 md:space-y-20">
            <h1 className="text-2xl font-bold mb-4 pt-10">Panel de Control</h1>
            <h2 className="text-lg text-gray-600 mb-5">
                {`¡Bienvenido${businessProducts[0]?.affiliated_business_id?.affiliated_business_name ? ' ' + businessProducts[0].affiliated_business_id.affiliated_business_name : ''}! Gestiona las opciones de tu comercio desde aquí`}
            </h2>
            
            {/* Tabla de Transacciones */}
            <div className="border border-gray-300 rounded-lg shadow-md overflow-hidden"> 
                <div className="bg-green-50 p-6 border-b border-gray-300">
                    <h3 className="text-xl font-semibold">Transacciones recientes</h3>
                </div>
                {transactionsError ? (
                    <div className="text-red-600 border border-red-300 p-4 m-6 rounded bg-red-50">
                        Error al cargar transacciones: {transactionsError}
                    </div>
                ) : (
                    <TransactionTable transactions={recentTransactions} loading={false} />
                )}
            </div>

            {/* Canje de Puntos */}
            <div>
                <h3 className="text-xl font-semibold mb-4">Canje de Puntos</h3>
                <PointsExchangeCards monthlyTotal={monthlyTotal} exchangeRate={exchangeRate} />
            </div>
            
            {/* Módulo de Consultas */}
            <div className="mb-12">
                <h3 className="text-xl font-semibold mb-4">Módulo de Consultas</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* a) Listado de productos que ofrecen */}
                    <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-md">
                        <h4 className="font-semibold text-lg mb-3 text-gray-800">Listado de productos ofrecidos</h4>
                        <div className="text-center">
                            <p className="text-4xl font-bold text-green-600 mb-2">{totalProductsOffered}</p>
                            <p className="text-sm text-gray-600">Productos disponibles</p>
                        </div>
                        {transformedProducts.length > 0 && (
                            <div className="mt-4 max-h-48 overflow-y-auto">
                                <ul className="space-y-2">
                                    {transformedProducts.map((product, idx) => (
                                        <li key={idx} className="text-sm text-gray-700 border-b border-gray-200 pb-2">
                                            <span className="font-medium">{product.titulo}</span>
                                            <span className="text-gray-500 ml-2">({product.costo} pts)</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* b) Top 5 de productos más canjeados */}
                    <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-md">
                        <h4 className="font-semibold text-lg mb-3 text-gray-800">Top 5 de productos más canjeados</h4>
                        {topProducts.length > 0 ? (
                            <div className="space-y-3">
                                {topProducts.map((product, idx) => (
                                    <div key={idx} className="flex items-center justify-between border-b border-gray-200 pb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold">
                                                {idx + 1}
                                            </span>
                                            <span className="text-sm font-medium text-gray-800">{product.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-green-600">{product.count}</p>
                                            <p className="text-xs text-gray-500">{product.points} pts</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-4">No hay canjes registrados</p>
                        )}
                    </div>

                    {/* c) Total de puntos canjeados en sus productos */}
                    <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-md">
                        <h4 className="font-semibold text-lg mb-3 text-gray-800">Total de puntos canjeados en sus productos</h4>
                        <div className="text-center">
                            <p className="text-4xl font-bold text-green-600 mb-2">{totalPointsRedeemed.toLocaleString()}</p>
                            <p className="text-sm text-gray-600">puntos totales</p>
                        </div>
                        <div className="mt-6 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Transacciones:</span>
                                <span className="font-semibold">{allTransactions.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Promedio por transacción:</span>
                                <span className="font-semibold">
                                    {allTransactions.length > 0 
                                        ? Math.round(totalPointsRedeemed / allTransactions.length).toLocaleString()
                                        : 0
                                    } pts
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}