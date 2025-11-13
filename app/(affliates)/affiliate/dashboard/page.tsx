import { CustomTable } from "@/components/custom/affiliate/affiliateTable";
import { PointsExchangeCards } from "@/components/custom/affiliate/redeemPoints";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Page() {

    const supabase = await createClient();
    const{ data:{ user } ,error} = await supabase.auth.getUser();

    if (error || !user) {
        redirect('/login');
    }


    const columns = [
        { header: 'Numero de Transacción', accessorKey: 'transactionID' },
        { header: 'Usuario', accessorKey: 'user' },
        { header: 'Producto', accessorKey: 'product' },
        { header: 'Cantidad', accessorKey: 'quantity' },
        { header: 'Fecha', accessorKey: 'date' },
        { header: 'Monto', accessorKey: 'amount' },
        { header: 'Estado', accessorKey: 'status' },
    ];



    //TODO: Hay que cambiar estos valores por llamadas a la API
    const monthlyTotal = 1500; // Ejemplo de total mensual de EcoColones
    const exchangeRate = 0.05; // Ejemplo de tasa de cambio EcoColones a moneda local

    const mockdata = [ //TODO:Hay que cambiar esto por llamadas a la API
        {
            transactionID: 'TXN123456',
            user: 'Maria Lopez',
            product: 'Crunchy Tacos',
            quantity: 10,
            date: '2024-06-15',
            amount: '2500',
            status: 'Completado',
        },
        {
            transactionID: 'TXN123456',
            user: 'Maria Lopez',
            product: 'Crunchy Tacos',
            quantity: 10,
            date: '2024-06-15',
            amount: '2500',
            status: 'Pendiente',
        },
        {
            transactionID: 'TXN123456',
            user: 'Maria Lopez',
            product: 'Crunchy Tacos',
            quantity: 10,
            date: '2024-06-15',
            amount: '2500',
            status: 'Cancelado',
        }
    ];


    return (
    <div className="container mx-auto px-4 space-y-12 md:space-y-20">
        <h1 className="text-2xl font-bold mb-4 pt-10">Panel de Control</h1>
        <h2 className="text-lg text-gray-600 mb-5">¡Bienvenido! Gestiona las opciones de tu comercio desde aquí</h2>
        {/* This is the table container*/}
        <div className="bg-green-50 min-h-96 max-h-96 border border-gray-300 rounded-lg p-6 shadow-md"> 
            <h3 className="text-xl font-semibold mb-4">Transacciones recientes</h3>
            <CustomTable columns={columns} data={mockdata} />
        </div>

        {/* This is the redeem points section */}
        
        <div>
            <h3 className="text-xl font-semibold mb-4">Canje de Puntos</h3>
            <PointsExchangeCards monthlyTotal={monthlyTotal} exchangeRate={exchangeRate} />
        </div>
        
        {/* This is the products section */}
        <div>
            Sección de productos
        </div>
    </div>
  );

}