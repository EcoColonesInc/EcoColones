"use client";
import React, { useMemo, useState } from "react";

type ConversionRate = {
  material: string;
  points: number | string;
  unit?: string | null;
};

export default function ConversionTable({
  conversionRates,
}: {
  conversionRates: ConversionRate[];
}) {
  const [weights, setWeights] = useState<Record<string, string>>({});

  const handleChange = (material: string, value: string) => {
    setWeights((s) => ({ ...s, [material]: value }));
  };

  const rows = useMemo(() => conversionRates || [], [conversionRates]);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-[#E9F4EE] text-gray-700 font-medium">
            <tr>
              <th className="py-2 px-3 rounded-tl-md">Material</th>
              <th className="py-2 px-3">Puntos por Unidad</th>
              <th className="py-2 px-3">Unidad</th>
              <th className="py-2 px-3">Peso (kg)</th>
              <th className="py-2 px-3 rounded-tr-md">Puntos calculados</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const key = row.material;
              const weightStr = weights[key] ?? "";
              const weight = parseFloat(weightStr || "0");
              const pointsPerUnit = typeof row.points === "number" ? row.points : parseFloat(String(row.points)) || 0;
              const calculatedPoints = Number.isFinite(pointsPerUnit) ? (weight * pointsPerUnit) : 0;

              return (
                <tr key={key} className="border-b border-gray-100">
                  <td className="py-2 px-3">{row.material}</td>
                  <td className="py-2 px-3">{pointsPerUnit ?? 'N/A'}</td>
                  <td className="py-2 px-3">{row.unit ?? 'kg'}</td>
                  <td className="py-2 px-3">
                    <input
                      aria-label={`peso-${key}`}
                      className="w-28 border rounded px-2 py-1 text-sm"
                      type="number"
                      min="0"
                      step="0.01"
                      value={weightStr}
                      onChange={(e) => handleChange(key, e.target.value)}
                      placeholder="0.00"
                    />
                  </td>
                  <td className="py-2 px-3">{Number.isFinite(calculatedPoints) ? `${calculatedPoints.toFixed(2)} pts` : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 mt-2">Introduce el peso en kilogramos para ver los puntos calculados.</p>
    </div>
  );
}
