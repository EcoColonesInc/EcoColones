"use client";

import { useState, useMemo, useCallback } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface BusinessTypeData {
  business_type: string | null;
  total: number | string | null;
}

interface BusinessTypePieChartProps {
  data: BusinessTypeData[];
}

const COLORS = ["#1E40AF", "#EF4444", "#F59E0B", "#22C55E", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"];

export function BusinessTypePieChart({ data }: BusinessTypePieChartProps) {
  const [showPercentage, setShowPercentage] = useState(true);
  
  const chartData = useMemo(() => 
    data.map((item) => ({
      name: item.business_type || "Desconocido",
      value: Number(item.total) || 0,
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
        <h4 className="font-semibold text-sm mb-2">Total de comercios Agrupados por Tipo de comercios</h4>
        <p className="text-sm text-gray-600">Total de comercios:</p>
        <p className="text-2xl font-bold">{chartData.reduce((sum, item) => sum + item.value, 0)}</p>
        <div className="mt-2 space-y-1">
          <p className="text-sm">Cantidad de comercios por tipo de comercios:</p>
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
