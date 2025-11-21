"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface TransactionFiltersProps {
    searchTerm: string;
    statusFilter: string;
    productFilter: string;
    dateFrom: string;
    dateTo: string;
    minAmount: string;
    maxAmount: string;
    availableProducts: string[];
    onSearchChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onProductChange: (value: string) => void;
    onDateFromChange: (value: string) => void;
    onDateToChange: (value: string) => void;
    onMinAmountChange: (value: string) => void;
    onMaxAmountChange: (value: string) => void;
    onClearFilters: () => void;
    totalCount: number;
    filteredCount: number;
}

export const TransactionFilters = ({
    searchTerm,
    statusFilter,
    dateFrom,
    dateTo,
    minAmount,
    maxAmount,
    productFilter,
    availableProducts,
    onSearchChange,
    onStatusChange,
    onDateFromChange,
    onDateToChange,
    onMinAmountChange,
    onMaxAmountChange,
    onProductChange,
    onClearFilters,
    totalCount,
    filteredCount
}: TransactionFiltersProps) => {

    // Contar filtros activos
    const activeFiltersCount = [
        searchTerm,
        statusFilter,
        dateFrom,
        dateTo,
        minAmount,
        maxAmount
    ].filter(filter => filter && filter.trim() !== '').length;

    const hasActiveFilters = activeFiltersCount > 0;
    const MAX_AMOUNT_RANGE = 10000; // ₡10,000 como máximo
    const currentMinAmount = minAmount ? parseInt(minAmount) : 0;
    const currentMaxAmount = maxAmount ? parseInt(maxAmount) : MAX_AMOUNT_RANGE;


    return (
        <div className="bg-gray-50 border border-gray-300 rounded-lg shadow-md p-4 h-fit">
            {/* Header más compacto */}
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Filtros</h3>
                <p className="text-xs text-gray-600 mt-1">
                    {filteredCount} de {totalCount} transacciones
                    {activeFiltersCount > 0 && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-200 text-gray-800">
                            {activeFiltersCount} activo{activeFiltersCount !== 1 ? 's' : ''}
                        </span>
                    )}
                </p>
                {hasActiveFilters && (
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={onClearFilters}
                        className="border-gray-300 text-gray-700 hover:bg-gray-100 w-full mt-2"
                    >
                        Limpiar filtros
                    </Button>
                )}
            </div>

            {/* Filtros en layout vertical para sidebar */}
            <div className="space-y-4">
                {/* Búsqueda */}
                <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                        Cliente
                    </Label>
                    <Input
                        type="text"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="bg-white border-gray-300 focus:border-gray-500 text-sm"
                    />
                </div>

                {/* Filtro por Producto */}
                <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                        Producto
                    </Label>
                    <select
                        value={productFilter}
                        onChange={(e) => onProductChange(e.target.value)}
                        className="w-full p-2 text-sm border border-gray-300 rounded-md bg-white focus:border-gray-500"
                    >
                        <option value="">Todos los productos</option>
                        {availableProducts.map((product) => (
                            <option key={product} value={product}>
                                {product}
                            </option>
                        ))}
                    </select>
                    {productFilter && (
                        <p className="text-xs text-gray-600 mt-1">
                            Filtrando: <strong>{productFilter}</strong>
                        </p>
                    )}
                </div>

                {/* Estado */}
                <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado
                    </Label>
                    <select
                        value={statusFilter}
                        onChange={(e) => onStatusChange(e.target.value)}
                        className="w-full p-2 text-sm border border-gray-300 rounded-md bg-white focus:border-gray-500"
                    >
                        <option value="">Todos</option>
                        <option value="active">Activas</option>
                        <option value="inactive">Inactivas</option>
                        <option value="cancelled">Canceladas</option>
                    </select>
                </div>

                {/* Fechas */}
                <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha Desde
                    </Label>
                    <Input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => onDateFromChange(e.target.value)}
                        className="bg-white border-gray-300 text-sm"
                    />
                </div>

                <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha Hasta
                    </Label>
                    <Input
                        type="date"
                        value={dateTo}
                        onChange={(e) => onDateToChange(e.target.value)}
                        className="bg-white border-gray-300 text-sm"
                    />
                </div>

                {/* Montos */}
                <div className="space-y-2">
                    <Label className="block text-sm font-medium text-gray-700 mb-3">
                        Rango de Montos
                    </Label>
                    
                    {/* Valores actuales */}
                    <div className="flex justify-between text-xs text-gray-600 mb-2">
                        <span>₡{currentMinAmount.toLocaleString()}</span>
                        <span>₡{currentMaxAmount.toLocaleString()}</span>
                    </div>

                    {/* Slider de rango */}
                    <Slider
                        min={0}
                        max={MAX_AMOUNT_RANGE}
                        step={100}
                        value={[currentMinAmount, currentMaxAmount]}
                        onValueChange={(values) => {
                            onMinAmountChange(values[0].toString());
                            onMaxAmountChange(values[1].toString());
                        }}
                        className="w-full"
                    />
                </div>
            </div>
        </div>
    );
};