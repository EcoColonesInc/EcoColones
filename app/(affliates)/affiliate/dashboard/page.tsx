import { createClient } from '@/utils/supabase/server'; 
// import { cookies } from 'next/headers'; // Ya no se necesita
import { CustomTable } from "@/components/custom/affiliate/affiliateTable";
import { PointsExchangeCards } from "@/components/custom/affiliate/dashredeemPoints";
import { DashProducts } from "@/components/custom/affiliate/dashProducts";
// import { getUserBusinessTransactions } from "@/lib/api/transactions"; // LÓGICA REEMPLAZADA: Se filtra por affiliatedBusinessId
import { getAllCurrencies } from "@/lib/api/currencies";
import { getProductsByAffiliatedBusinessId } from "@/lib/api/products"; 
import { getBusinessByManagerId} from "@/lib/api/affiliatedbusiness"; 


// Tipos
type Transaction = {
    transaction_code: string;
    first_name: string;
    product_name: string;
    product_amount: number | string | null;
    created_at: string;
    total_price: number | string | null;
    state: string;
};

// Tipo de datos que retorna getProductsByAffiliatedBusinessId (Datos brutos de DB)
type ProductData = {
    affiliated_business_x_prod: string;
    product_id: { product_id: string, product_name: string, description: string, state: string };
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


// -------------------------------------------------------------------
// MOCK DE FUNCIÓN RPC: Asume que esta función existe en el archivo de API.
// La estructura de datos 'data' debe coincidir con lo que retorna el RPC
// -------------------------------------------------------------------
type RawTransactionData = {
    transaction_code: string;
    created_at: string;
    total_price: number;
    state: string;
    product_amount: number;
    product_name: string;
    first_name: string;
}

// La función RPC se importaría de un archivo como lib/api/transactions.ts
// Como no está disponible, la definimos localmente para que el código compile.
async function getTransactionsByAffiliatedBusinessId(affiliatedBusinessId: string): Promise<{ error: string | null, data: RawTransactionData[] | null }> {
    const supabase = await createClient();
    // Usa la función RPC con el parámetro
    const { data, error } = await supabase.rpc('get_transactions_by_affiliated_business_id', { p_affiliated_business_id: affiliatedBusinessId });
    
    if (error) {
        console.error('Error fetching transactions via RPC:', error);
        return { error: error.message, data: null };
    }
    
    // Suponemos que el RPC retorna un array de objetos con las propiedades necesarias
    return { error: null, data: data as RawTransactionData[] };
}
// -------------------------------------------------------------------


export default async function Page() {

    const columns = [
        { header: 'Numero de Transacción', accessorKey: 'transaction_code' },
        { header: 'Nombre del cliente', accessorKey: 'first_name'},
        { header: 'Producto', accessorKey: 'product_name' },
        { header: 'Cantidad', accessorKey: 'product_amount' },
        { header: 'Fecha', accessorKey: 'created_at' },
        { header: 'Monto', accessorKey: 'total_price' },
        { header: 'Estado', accessorKey: 'state' },
    ];
    
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
            affiliatedBusinessId = businessData.affiliated_business_id;
        } else {
            productsError = "No se encontró un negocio afiliado para el ID de usuario proporcionado.";
        }
    }

    // -------------------------------------------------------------------
    // --- LÓGICA DE TRANSACCIONES FILTRADAS POR ID DE NEGOCIO (USANDO RPC) ---
    // -------------------------------------------------------------------
    let allTransactions: Transaction[] = [];
    let transactionsError: string | null = null;
    let monthlyTotal = 0; 
    
    if (affiliatedBusinessId) {
        // Llama a la función RPC
        const { data: rawTransactions, error: fetchError } = await getTransactionsByAffiliatedBusinessId(affiliatedBusinessId);

        if (fetchError) {
            transactionsError = `Error al obtener transacciones: ${fetchError}`;
            console.error("Error al cargar transacciones del negocio:", transactionsError);
        } else if (rawTransactions) {
            // Mapear los datos que retorna el RPC al tipo 'Transaction'
            allTransactions = rawTransactions.map(tx => ({
                transaction_code: tx.transaction_code,
                first_name: tx.first_name || 'N/A', // Asumiendo que el RPC retorna el nombre del cliente
                product_name: tx.product_name || 'N/A', // Asumiendo que el RPC retorna el nombre del producto
                product_amount: tx.product_amount,
                created_at: tx.created_at,
                total_price: tx.total_price,
                state: tx.state,
            } as Transaction));
        }
    } else {
        // Si no hay ID de negocio, el error será el de autenticación/negocio no encontrado.
        transactionsError = productsError; 
    }
    
    let recentTransactions: Transaction[] = [];

    // Cálculo del total mensual (se reubica y usa `allTransactions`)
    if (!transactionsError) {
        recentTransactions = allTransactions;
        monthlyTotal = allTransactions.reduce((sum, transaction) => {
            const amountValue = (transaction.total_price ?? 0).toString();
            const amount = parseFloat(amountValue); 
            return sum + amount;
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
    
    const tableData = recentTransactions.map(tx => {
        const normalizedTx = { 
            ...tx, 
            product_amount: tx.product_amount ?? 0,
            total_price: tx.total_price ?? 0,
            state: tx.state ?? 'N/A',
        };
        return normalizedTx as Record<string, string | number>;
    });

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
            businessProducts = (productsData as unknown as ProductData[]) || [];
            productsError = null;

            // PASO 3: Mapear los datos de la base de datos (ProductData) al tipo Product
            transformedProducts = businessProducts.map(item => ({
                id: item.product_id.product_id, // string UUID
                imagen: '', 
                titulo: item.product_id.product_name,
                descripcion: item.product_id.description,
                costo: item.product_price,
            }));
        }
    } else if (!productsError) {
        productsError = "El usuario logueado no está vinculado a un comercio afiliado.";
    }


    return (
        <div className="container mx-auto px-4 space-y-12 md:space-y-20">
            <h1 className="text-2xl font-bold mb-4 pt-10">Panel de Control</h1>
            <h2 className="text-lg text-gray-600 mb-5">¡Bienvenido! Gestiona las opciones de tu comercio desde aquí</h2>
            
            {/* Tabla de Transacciones */}
            <div className="bg-green-50 min-h-96 max-h-96 border border-gray-300 rounded-lg p-6 shadow-md"> 
                <h3 className="text-xl font-semibold mb-4">Transacciones recientes</h3>
                {transactionsError ? (
                    <div className="text-red-600 border border-red-300 p-4 rounded bg-red-50">
                        Error al cargar transacciones: {transactionsError}
                    </div>
                ) : (
                    <CustomTable columns={columns} data={tableData} />
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