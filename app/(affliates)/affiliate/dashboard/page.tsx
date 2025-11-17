import { CustomTable } from "@/components/custom/affiliate/affiliateTable";
import { PointsExchangeCards } from "@/components/custom/affiliate/dashredeemPoints";
import { DashProducts } from "@/components/custom/affiliate/dashProducts";
import { mockProducts, mockTransactions } from "@/app/mockups/mockups";


/* Aun no se usa esta funcion pero es necesaria para futuras implementaciones
async function getAffiliateData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Verificar si el user.id existe en la base de datos
    const { data: comercio, error } = await supabase
        .from('affiliatedbusiness') // Cambia esto al nombre de tu tabla
        .select('*')
        .eq('affiliated_business_id', user.id) // Cambia 'user_id' al nombre de tu columna
        .single();

    console.log('¿Se encontró comercio?:', comercio);
    console.log('¿Hubo error?:', error);

    return user;
}*/


export default async function Page() {

    //const user = await getAffiliateData();

    const columns = [
        { header: 'Numero de Transacción', accessorKey: 'transactionID' },
        { header: 'Usuario', accessorKey: 'user' },
        { header: 'Producto', accessorKey: 'product' },
        { header: 'Cantidad', accessorKey: 'quantity' },
        { header: 'Fecha', accessorKey: 'date' },
        { header: 'Monto', accessorKey: 'amount' },
        { header: 'Estado', accessorKey: 'status' },
    ];



    //TODO: Hay que cambiar estos valores por consultas a la BD y los mockups solo son para pruebas
    //TODO: Aun falta arreglar las rutas de los botones editar.
    const monthlyTotal = 1500; 
    const exchangeRate = 0.05; 



    return (
    <div className="container mx-auto px-4 space-y-12 md:space-y-20">
        <h1 className="text-2xl font-bold mb-4 pt-10">Panel de Control</h1>
        <h2 className="text-lg text-gray-600 mb-5">¡Bienvenido! Gestiona las opciones de tu comercio desde aquí</h2>
        {/* This is the table container*/}
        <div className="bg-green-50 min-h-96 max-h-96 border border-gray-300 rounded-lg p-6 shadow-md"> 
            <h3 className="text-xl font-semibold mb-4">Transacciones recientes</h3>
            <CustomTable columns={columns} data={mockTransactions} />
        </div>

        {/* This is the redeem points section */}
        <div>
            <h3 className="text-xl font-semibold mb-4">Canje de Puntos</h3>
            <PointsExchangeCards monthlyTotal={monthlyTotal} exchangeRate={exchangeRate} />
        </div>
        {/* This is the products section */}
        <div className="mb-20">
            <h3 className="text-xl font-semibold mb-4">Productos Registrados</h3>
            <DashProducts products={mockProducts} />
        </div>
    </div>
  );

}