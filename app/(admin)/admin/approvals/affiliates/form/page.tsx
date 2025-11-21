"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function RegisterAffiliateMockup() {
  const [selectedType, setSelectedType] = useState<string>("tienda");

  const toggle = (value: string) => {
    setSelectedType(value);
  };

  const types = [
    { id: "tienda", label: "Tienda Minorista", icon: "🛒" },
    { id: "super", label: "Supermercado", icon: "🛍️" },
    { id: "restaurante", label: "Restaurante", icon: "🍽️" },
    { id: "cafeteria", label: "Cafetería", icon: "☕" },
    { id: "ferreteria", label: "Ferretería", icon: "🔧" },
    { id: "farmacia", label: "Farmacia", icon: "💊" },
  ];

  return (
    <div className="min-h-screen bg-white px-6 md:px-16 py-10">
      {/* Title */}
      <h1 className="text-4xl font-bold mb-10">Registro de comercios afiliados</h1>

      {/* Main container */}
      <div className="bg-[#F7FCFA] border border-gray-200 rounded-xl p-8 shadow-sm space-y-10">
        
        {/* Información del negocio */}
        <section>
          <h3 className="font-semibold text-lg mb-1">Información del negocio</h3>
          <p className="text-sm text-gray-600 mb-4">Detalles sobre tu comercio</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium block mb-1">Nombre del negocio</label>
              <input
                type="text"
                placeholder="Ej: Mi tienda eco"
                className="w-full bg-[#E6F2EA] rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Nombre del encargado</label>
              <input
                type="text"
                placeholder="Ej: Pedro Solís"
                className="w-full bg-[#E6F2EA] rounded-md px-3 py-2"
              />
            </div>
          </div>
        </section>

        {/* Tipo de comercio */}
        <section>
          <h3 className="font-semibold text-lg mb-3">Tipo de comercio</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {types.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => toggle(t.id)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-md border transition ${
                  selectedType === t.id
                    ? "bg-green-100 border-green-500"
                    : "bg-white border-gray-300"
                }`}
              >
                <input type="radio" readOnly checked={selectedType === t.id} />
                <span className="text-lg">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </section>

        {/* Ubicación y contacto */}
        <section>
          <h3 className="font-semibold text-lg mb-3">Ubicación y contacto</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div>
              <label className="text-sm font-medium block mb-1">Distrito</label>
              <input type="text" placeholder="Ej. Escazú" className="w-full bg-[#E6F2EA] rounded-md px-3 py-2" />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Ciudad</label>
              <input type="text" placeholder="Ej. San José" className="w-full bg-[#E6F2EA] rounded-md px-3 py-2" />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Provincia</label>
              <input type="text" placeholder="Ej. San José" className="w-full bg-[#E6F2EA] rounded-md px-3 py-2" />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">País</label>
              <input type="text" placeholder="Costa Rica" className="w-full bg-[#E6F2EA] rounded-md px-3 py-2" />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Teléfono</label>
              <input type="text" placeholder="+506 8888-8888" className="w-full bg-[#E6F2EA] rounded-md px-3 py-2" />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Email</label>
              <input type="email" placeholder="contacto@gmail.com" className="w-full bg-[#E6F2EA] rounded-md px-3 py-2" />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Sitio web</label>
              <input type="text" placeholder="www.tunegocio.com" className="w-full bg-[#E6F2EA] rounded-md px-3 py-2" />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Residuos mensuales (kg)</label>
              <input type="number" placeholder="1000" className="w-full bg-[#E6F2EA] rounded-md px-3 py-2" />
            </div>
          </div>

          {/* Description */}
          <label className="text-sm font-medium block mt-6 mb-1">Descripción</label>
          <textarea
            placeholder="Describe tu negocio..."
            className="w-full bg-[#E6F2EA] rounded-md px-3 py-2 h-32 resize-none"
          />
        </section>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <Button className="bg-green-600 hover:bg-green-700 text-white px-6">
            Registrar comercio
          </Button>
        </div>

      </div>
    </div>
  );
}
