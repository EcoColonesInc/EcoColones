"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts";

interface ProductsByYearData {
  year: number | null;
  total_products: number | string | null;
}

interface ProductsByYearBarChartProps {
  data: ProductsByYearData[];
}

export function ProductsByYearBarChart({ data }: ProductsByYearBarChartProps) {
  const [showPercentage, setShowPercentage] = useState(true);
  
  const chartData = data.map((item) => ({
    year: item.year || 0,
    total: Number(item.total_products) || 0,
  }));

  const total = chartData.reduce((sum, item) => sum + item.total, 0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderCustomLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    if (!x || !y || !width || !height || value === undefined) return null;
    
    const displayValue = showPercentage 
      ? `${(total > 0 ? ((value / total) * 100).toFixed(1) : 0)}%`
      : value;
    return (
      <text
        x={x + width / 2}
        y={y + height / 2}
        fill="white"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={12}
        fontWeight="bold"
      >
        {displayValue}
      </text>
    );
  };

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
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" label={{ value: "Año", position: "insideBottom", offset: -10 }} />
          <YAxis label={{ value: "Total de productos canjeados", angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <Bar dataKey="total" fill="#22C55E">
            <LabelList dataKey="total" content={renderCustomLabel} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-sm mb-2">Total de Productos Canjeados por Año</h4>
        <p className="text-sm text-gray-600">Total de comercios:</p>
        <p className="text-2xl font-bold">{chartData.reduce((sum, item) => sum + item.total, 0)}</p>
        <div className="mt-2 space-y-1">
          <p className="text-sm">Cantidad de productos vendidos por año:</p>
          {chartData.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span>Año {item.year}</span>
              <span className="font-medium">{item.total}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
