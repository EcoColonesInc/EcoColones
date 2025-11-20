import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow
         } from "@/components/ui/table";
import type { AffiliateTransaction } from "@/types/transactions";

interface TransactionTableProps {
    transactions: AffiliateTransaction[];
    loading?: boolean;
}

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatPrice(price: number, currency: string = 'CRC') {
    return new Intl.NumberFormat("es-CR", {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0
    }).format(price);
}
function getStatusLabel(status: string) {
    switch (status.toLowerCase()) {
        case 'active':
            return 'Activa';
        case 'inactive':
            return 'Inactiva';
        case 'cancelled':
            return 'Cancelada';
        default:
            return status;
    }
}

function getStatusStyles(status: string) {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
        case 'active':
            return 'bg-green-100 text-green-800 border-green-600';
        case 'inactive':
            return 'bg-yellow-100 text-yellow-800 border-yellow-600';
        case 'cancelled':
            return 'bg-red-100 text-red-800 border-red-600';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-600';
    }
}
export const TransactionTable =({ 
    transactions, 
    loading = false,
}: TransactionTableProps) => {

    if (loading) {
        return (
            <div className="bg-green-50 border border-green-300 rounded-lg p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-12 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-green-50 max-h-120 overflow-y-auto overflow-x-auto">
            {transactions.length === 0 ? (
                // Estado vacío
                <div className="p-8 text-center text-gray-500">
                    <div className="text-4xl mb-2">📋</div>
                    <p className="text-lg font-medium">No hay transacciones</p>
                    <p className="text-sm">No se encontraron transacciones con los filtros aplicados</p>
                </div>
            ) : (
                <Table>
                    <TableHeader className="sticky top-0 bg-green-100 z-10">
                        <TableRow className="hover:bg-green-100">
                            <TableHead className="bg-green-50 border-b border-gray-300 text-center font-semibold">Código</TableHead>
                            <TableHead className="bg-green-50 border-b border-gray-300 text-center font-semibold">Cliente</TableHead>
                            <TableHead className="bg-green-50 border-b border-gray-300 text-center font-semibold">Producto</TableHead>
                            <TableHead className="bg-green-50 border-b border-gray-300 text-center font-semibold">Cantidad</TableHead>
                            <TableHead className="bg-green-50 border-b border-gray-300 text-center font-semibold">Total</TableHead>
                            <TableHead className="bg-green-50 border-b border-gray-300 text-center font-semibold">Estado</TableHead>
                            <TableHead className="bg-green-50 border-b border-gray-300 text-center font-semibold">Fecha</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((transaction) => (
                            <TableRow 
                                key={transaction.ab_transaction_id} 
                                className="bg-green-50 hover:bg-green-100"
                            >
                                {/* Código de transacción */}
                                <TableCell className="border-b border-gray-300 text-center">
                                    <span className="font-mono text-xs">
                                        {transaction.transaction_code}
                                    </span>
                                </TableCell>

                                {/* Cliente */}
                                <TableCell className="border-b border-gray-300 text-center">
                                    <div className="font-medium">
                                        {transaction.person_id.first_name} {transaction.person_id.last_name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {transaction.person_id.user_name}
                                    </div>
                                </TableCell>

                                {/* Producto */}
                                <TableCell className="border-b border-gray-300 text-center">
                                    <div className="font-medium">
                                        {transaction.product_id.product_name}
                                    </div>
                                </TableCell>

                                {/* Cantidad */}
                                <TableCell className="border-b border-gray-300 text-center">
                                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                        {transaction.product_amount}
                                    </span>
                                </TableCell>

                                {/* Total */}
                                <TableCell className="border-b border-gray-300 text-center">
                                    <span className="font-semibold">
                                        {formatPrice(transaction.total_price, transaction.currency.currency_name)}
                                    </span>
                                </TableCell>

                                {/* Estado */}
                                <TableCell className="border-b border-gray-300 text-center">
                                    <span className={`inline-block px-3 py-1 rounded-full border-2 font-medium ${getStatusStyles(transaction.state)}`}>
                                        {getStatusLabel(transaction.state)}
                                    </span>
                                </TableCell>

                                {/* Fecha */}
                                <TableCell className="border-b border-gray-300 text-center">
                                    <span className="text-sm text-gray-600">
                                        {formatDate(transaction.created_at)}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
)};