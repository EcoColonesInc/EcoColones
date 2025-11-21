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
const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        
        // Verificación de fecha inválida (e.g., "Invalid Date")
        if (isNaN(date.getTime())) {
            return 'Formato Inválido';
        }

        const year = date.getFullYear();
        // getMonth() es 0-indexado, por eso se añade 1.
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}/${month}/${day}`; // Formato yyyy/mm/dd
    } catch (e) {
        console.error("Error formatting date:", e);
        return 'N/A';
    }
};


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
    // --- LÓGICA DE MONEDA (sin cambios) ---
    const { data: currenciesData, error: currencyError } = await getAllCurrencies();
    let exchangeRate = 0.05;

    if (!currencyError && currenciesData) {
        const colonCurrency = currenciesData.find(c => c.currency_name === 'CRC'); 
        if (colonCurrency && colonCurrency.currency_exchange) {
            exchangeRate = colonCurrency.currency_exchange;
        }
    }

    // -------------------------------------------------------------------
    // --- LÓGICA PARA OBTENER PRODUCTOS DEL COMERCIO LOGUEADO (sin cambios) ---
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
            
            {/* Productos */}
            <div className="mb-20">
                <h3 className="text-xl font-semibold mb-4">Productos Registrados</h3>
                
                {productsError ? (
                    <div className="text-red-600 border border-red-300 p-4 rounded bg-red-50">
                        {productsError}
                    </div>
                ) : (
                    // Usamos los productos TRANSFORMADOS
                    <DashProducts products={transformedProducts} /> 
                )}
            </div>
        </div>
    );
}