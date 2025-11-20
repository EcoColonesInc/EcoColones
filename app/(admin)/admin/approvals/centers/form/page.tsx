"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function RegisterCenterMockup() {
  const [selected, setSelected] = useState<string[]>(["plastico"]);

  const toggle = (m: string) => {
    setSelected((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  };

  return (
    <div className="min-h-screen bg-white px-6 md:px-16 py-10">
      {/* Title */}
      <h1 className="text-4xl font-bold mb-2">Registro de Centros de Acopio</h1>
      <p className="text-gray-600 mb-10 max-w-2xl">
        Termina de registrar el centro de acopio
      </p>

      {/* Form Container */}
      <div className="bg-[#F7FCFA] border border-gray-200 rounded-xl p-8 shadow-sm space-y-10">
        {/* Información Básica */}
        <section>
          <h3 className="font-semibold text-lg mb-1">Información Básica</h3>
          <p className="text-sm text-gray-600 mb-4">
            Datos generales del centro de acopio
          </p>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium block mb-1">
                Nombre del centro
              </label>
              <input
                type="text"
                className="w-full bg-[#E6F2EA] rounded-md px-3 py-2"
                placeholder="Ej: Centro de Acopio Verde"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">
                Nombre del encargado del centro
              </label>
              <input
                type="text"
                className="w-full bg-[#E6F2EA] rounded-md px-3 py-2"
                placeholder="Ej: Ramón Villa de la Fuente"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Distrito</label>
              <input
                type="text"
                className="w-full bg-[#E6F2EA] rounded-md px-3 py-2"
                placeholder="Ej. Escazú"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Ciudad</label>
              <input
                type="text"
                className="w-full bg-[#E6F2EA] rounded-md px-3 py-2"
                placeholder="Ej. San José"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Provincia</label>
              <input
                type="text"
                className="w-full bg-[#E6F2EA] rounded-md px-3 py-2"
                placeholder="Ej. San José"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">País</label>
              <input
                type="text"
                className="w-full bg-[#E6F2EA] rounded-md px-3 py-2"
                placeholder="Costa Rica"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Teléfono</label>
              <input
                type="text"
                className="w-full bg-[#E6F2EA] rounded-md px-3 py-2"
                placeholder="+506 8888-8888"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Email</label>
              <input
                type="email"
                className="w-full bg-[#E6F2EA] rounded-md px-3 py-2"
                placeholder="contacto@centro.com"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Latitud</label>
              <input
                type="text"
                className="w-full bg-[#E6F2EA] rounded-md px-3 py-2"
                placeholder="Ej. 9.9836"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Longitud</label>
              <input
                type="text"
                className="w-full bg-[#E6F2EA] rounded-md px-3 py-2"
                placeholder="Ej. -84.1785"
              />
            </div>
          </div>
        </section>

        {/* Tipos de Materiales */}
        <section>
          <h3 className="font-semibold text-lg mb-1">Tipos de Materiales</h3>
          <p className="text-sm text-gray-600 mb-4">
            Selecciona los materiales que tu centro acepta
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Plástico",
              "Aluminio",
              "Papel",
              "Cartón",
              "Vidrio",
              "Tetra Pak",
              "Textiles",
              "Otros",
            ].map((label) => {
              const id = label.toLowerCase().replace(" ", "_");

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggle(id)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-md border ${
                    selected.includes(id)
                      ? "bg-green-100 border-green-500"
                      : "bg-white border-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    readOnly
                    checked={selected.includes(id)}
                    className="h-4 w-4"
                  />
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            Registrar Centro
          </Button>
        </div>
      </div>
    </div>
  );
}
