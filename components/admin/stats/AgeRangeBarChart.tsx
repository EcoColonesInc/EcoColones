"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts";

interface AgeRangeData {
  age_range: string | null;
  user_count: number | string | null;
}

interface AgeRangeBarChartProps {
  data: AgeRangeData[];
}

export function AgeRangeBarChart({ data }: AgeRangeBarChartProps) {
  const [showPercentage, setShowPercentage] = useState(true);
  
  const chartData = data.map((item) => ({
    ageRange: item.age_range || "Desconocido",
    usuarios: Number(item.user_count) || 0,
  }));

  const total = chartData.reduce((sum, item) => sum + item.usuarios, 0);

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
          <XAxis dataKey="ageRange" label={{ value: "Rango de edades", position: "insideBottom", offset: -10 }} />
          <YAxis label={{ value: "Usuarios", angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <Bar dataKey="usuarios" fill="#22C55E">
            <LabelList dataKey="usuarios" content={renderCustomLabel} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-sm mb-2">Total de usuarios agrupados por rango de edad</h4>
        <p className="text-sm text-gray-600">Total de Usuarios:</p>
        <p className="text-2xl font-bold">{chartData.reduce((sum, item) => sum + item.usuarios, 0)}</p>
        <div className="mt-2 space-y-1">
          <p className="text-sm">Cantidad de usuarios por edad:</p>
          {chartData.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span>{item.ageRange}</span>
              <span className="font-medium">{item.usuarios}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
