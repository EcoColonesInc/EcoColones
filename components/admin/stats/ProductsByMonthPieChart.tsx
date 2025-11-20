"use client";

import { useState, useMemo, useCallback } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface ProductsByMonthData {
  year: number | null;
  month: number | null;
  month_name: string | null;
  total_products: number | string | null;
}

interface ProductsByMonthPieChartProps {
  data: ProductsByMonthData[];
  selectedYear?: number;
}

const COLORS = [
  "#1E40AF", // Enero - Azul oscuro
  "#EF4444", // Febrero - Rojo
  "#F59E0B", // Marzo - Naranja
  "#06B6D4", // Abril - Cyan
  "#8B5CF6", // Mayo - Púrpura
  "#22C55E", // Junio - Verde
  "#F97316", // Julio - Naranja oscuro
  "#A16207", // Agosto - Marrón
  "#1E3A8A", // Septiembre - Azul muy oscuro
  "#14B8A6", // Octubre - Teal
];

export function ProductsByMonthPieChart({ data, selectedYear }: ProductsByMonthPieChartProps) {
  const [showPercentage, setShowPercentage] = useState(true);
  
  const chartData = useMemo(() => 
    data.map((item) => ({
      name: item.month_name || "Desconocido",
      value: Number(item.total_products) || 0,
      month: item.month || 0,
    })),
    [data]
  );

  const total = useMemo(() => 
    chartData.reduce((sum, item) => sum + item.value, 0),
    [chartData]
  );

  const renderLabel = useCallback((entry: { value: number }) => {
    if (showPercentage) {
      const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0;
      return `${percentage}%`;
    }
    return entry.value;
  }, [showPercentage, total]);

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">Mostrar:</label>
        <button
          onClick={() => setShowPercentage(true)}
          className={`px-3 py-1 text-sm rounded ${
            showPercentage 
              ? "bg-green-500 text-white" 
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Porcentaje
        </button>
        <button
          onClick={() => setShowPercentage(false)}
          className={`px-3 py-1 text-sm rounded ${
            !showPercentage 
              ? "bg-green-500 text-white" 
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Valor Real
        </button>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend layout="horizontal" verticalAlign="bottom" align="center" />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-sm mb-2">Total de Productos Canjeados por mes</h4>
        <p className="text-sm text-gray-600">Año de gráfico:</p>
        <p className="text-2xl font-bold">{selectedYear || new Date().getFullYear()}</p>
        <div className="mt-2 space-y-1">
          <p className="text-sm">Total de productos canjeados en el año:</p>
          <p className="text-lg font-semibold">{chartData.reduce((sum, item) => sum + item.value, 0)}</p>
          <p className="text-sm mt-2">Cantidad de productos vendidos por año:</p>
          {chartData.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span>{item.name}</span>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
