"use client";

import { useState } from "react";
type WeightMap = Record<string, number>;
export default function UserCalculatorPage() {
  const materials = [
    { name: "Papel", rate: 10 },
    { name: "Cartón", rate: 15 },
    { name: "Vidrio", rate: 15 },
    { name: "Tetra Pak", rate: 15 },
    { name: "Aceite", rate: 15 },
    { name: "Textiles", rate: 20 },
    { name: "Metales", rate: 25 },
  ];

  const [weights, setWeights] = useState<WeightMap>(
    materials.reduce((acc, m) => ({ ...acc, [m.name]: 0 }), {})
  );

  const handleChange = (material: string, value: string) => {
    setWeights((prev) => ({
      ...prev,
      [material]: Number(value),
    }));
  };

  const calculatePoints = (material: string, rate: number) => {
    return (weights[material] ?? 0) * rate;
  };

  return (
    <div className="min-h-screen bg-white px-6 md:px-16 py-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT SIDE — Calculator */}
        <div className="lg:col-span-2 bg-[#F7FCFA] border border-gray-200 rounded-xl p-8">
          {materials.map((mat) => (
            <div
              key={mat.name}
              className="grid grid-cols-12 items-center gap-3 mb-5"
            >
              {/* Material Name */}
              <div className="col-span-2 font-medium text-gray-700">
                {mat.name}
              </div>

              {/* Weight Input */}
              <input
                type="number"
                min="0"
                value={weights[mat.name]}
                onChange={(e) => handleChange(mat.name, e.target.value)}
                className="col-span-4 bg-white border border-gray-300 rounded-md px-3 py-2"
              />

              <div className="col-span-1 text-gray-600">kg</div>

              {/* "=" */}
              <div className="col-span-1 text-center font-semibold">=</div>

              {/* Points Result */}
              <input
                disabled
                value={calculatePoints(mat.name, mat.rate)}
                className="col-span-3 bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-700"
              />

              <div className="col-span-1 text-gray-600">pts</div>
            </div>
          ))}
        </div>

        {/* RIGHT SIDE — Conversion Table */}
        <div className="bg-[#F7FCFA] border border-gray-200 rounded-xl p-6 h-fit">
          <h3 className="font-semibold text-lg mb-4">
            Conversión del Peso a Puntos
          </h3>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="pb-3">Material</th>
                <th className="pb-3">Puntos por Peso (CRC)</th>
              </tr>
            </thead>

            <tbody>
              {materials.map((m) => (
                <tr key={m.name} className="border-t border-gray-200">
                  <td className="py-2">{m.name}</td>
                  <td>{m.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
