"use client"

import { useState, useMemo } from 'react';
import { TransactionTable } from './transactionTable';
import { TransactionFilters } from './transactionFilters';
import { AffiliateTransaction } from '@/types/transactions';

interface TransactionManagerProps {
    initialTransactions: AffiliateTransaction[];
    errMsg: string | null;
}

export const TransactionManager = ({ initialTransactions, errMsg }: TransactionManagerProps) => {
    // Estados de filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [productFilter, setProductFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');
    
    const uniqueProducts = useMemo(() => {
        const productsSet = new Set<string>();
        initialTransactions.forEach(transaction => {
            if (transaction.product_id?.product_name) {
                productsSet.add(transaction.product_id.product_name);
            }
        });
        return Array.from(productsSet).sort(); // Ordenados alfabéticamente
    }, [initialTransactions]);

    // Lógica de filtrado
    const filteredTransactions = useMemo(() => {
        return initialTransactions.filter(transaction => {
            // Filtro por nombre
            if (searchTerm) {
                const fullName = `${transaction.person_id?.first_name} ${transaction.person_id?.last_name}`.toLowerCase();
                if (!fullName.includes(searchTerm.toLowerCase())) {
                    return false;
                }
            }

            // Filtro por estado
            if (statusFilter && transaction.state !== statusFilter) {
                return false;
            }

            // Filtro por fecha
            if (dateFrom || dateTo) {
                const transactionDate = new Date(transaction.created_at);
                if (dateFrom && transactionDate < new Date(dateFrom)) return false;
                if (dateTo && transactionDate > new Date(dateTo)) return false;
            }

            // Filtro por producto
            if (productFilter && transaction.product_id?.product_name !== productFilter) {
                return false;
            }

            // Filtro por monto
            if (minAmount) {
                const minAmountNum = parseFloat(minAmount);
                if (transaction.total_price < minAmountNum) return false;
            }

            if (maxAmount) {
                const maxAmountNum = parseFloat(maxAmount);
                if (transaction.total_price > maxAmountNum) return false;
            }

            return true;
        });
    }, [initialTransactions, searchTerm, statusFilter, productFilter, dateFrom, dateTo, minAmount, maxAmount]);

    // Función para limpiar todos los filtros
    const clearAllFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setDateFrom('');
        setProductFilter('');
        setDateTo('');
        setMinAmount('');
        setMaxAmount('');
    };
    
    if (errMsg) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
                <h4 className="font-semibold text-red-800">Error al cargar transacciones:</h4>
                <p className="text-sm text-red-700">{errMsg}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 mt-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Tabla a la izquierda */}
                <div className="xl:col-span-2">
                    <div className="bg-green-50 h-auto border border-gray-300 rounded-lg p-6 shadow-md">
                        <TransactionTable 
                            transactions={filteredTransactions}
                            loading={false}
                        />
                        
                        {/* Total transacciones*/}
                        <div className="mt-3 text-center">
                            <p className="text-sm text-green-700">
                                Mostrando {filteredTransactions.length} de {initialTransactions.length} transacciones
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="xl:col-span-1">
                    <TransactionFilters
                        searchTerm={searchTerm}
                        statusFilter={statusFilter}
                        productFilter={productFilter}
                        dateFrom={dateFrom}
                        dateTo={dateTo}
                        minAmount={minAmount}
                        maxAmount={maxAmount}
                        availableProducts={uniqueProducts}
                        onSearchChange={setSearchTerm}
                        onStatusChange={setStatusFilter}
                        onProductChange={setProductFilter} 
                        onDateFromChange={setDateFrom}
                        onDateToChange={setDateTo}
                        onMinAmountChange={setMinAmount}
                        onMaxAmountChange={setMaxAmount}
                        onClearFilters={clearAllFilters}
                        totalCount={initialTransactions.length}
                        filteredCount={filteredTransactions.length}
                    />
                </div>
            </div>
        </div>
    );
};