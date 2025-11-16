import { CustomTable } from "@/components/custom/customTable";
export default function Page() {
    
    const columns = [
        { header: 'Numero de Transacción', accessorKey: 'transactionID' },
        { header: 'Usuario', accessorKey: 'user' },
        { header: 'Producto', accessorKey: 'product' },
        { header: 'Cantidad', accessorKey: 'quantity' },
        { header: 'Fecha', accessorKey: 'date' },
        { header: 'Monto', accessorKey: 'amount' },
        { header: 'Estado', accessorKey: 'status' },
    ];

    const mockdata = [
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
            status: 'Completado',
        },
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
            status: 'Completado',
        },
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
            status: 'Completado',
        },
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
            status: 'Completado',
        },
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
            status: 'Completado',
        },
    ];


    return (
    <div className="container mx-auto px-4 space-y-12 md:space-y-20">
      <h1 className="text-2xl font-bold mb-4">Panel de Control</h1>
      <h2 className="text-lg text-gray-600 mb-10">¡Bienvenido! Gestiona las opciones de tu comercio desde aquí</h2>
      <div className="bg-green-50 border border-gray-300 rounded-lg p-6 shadow-md">
        <h3 className="text-xl font-semibold mb-4">Transacciones recientes</h3>
        <CustomTable columns={columns} data={mockdata} />
      </div>
    </div>
  );

}