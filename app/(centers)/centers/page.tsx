"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import CustomMap from "@/components/ui/map";

type Center = {
  collectioncenter_id: string | number;
  name?: string | null;
  phone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  district_id?: { district_name?: string | null } | null;
  person_id?: { first_name?: string | null; last_name?: string | null } | null;
};

export default function CenterHome() {
  const [centers, setCenters] = useState<Center[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/collectioncenters/get");
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error ?? "Error fetching centers");

        // Normalize response shape
        let rows: Center[] = [];
        if (Array.isArray(body)) {
          rows = body as Center[];
        } else if (body && typeof body === 'object' && 'data' in body) {
          rows = Array.isArray((body as { data?: unknown }).data) ? (body as { data?: unknown }).data as Center[] : [];
        } else {
          rows = [];
        }

        if (mounted) setCenters(rows);
      } catch (err: unknown) {
        console.error("Error fetching centers:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);
  return (
    <div className="min-h-screen bg-white py-10 px-6 md:px-16">
      <div className="max-w-6xl mx-auto">
        {/* --- Title --- */}
        <h1 className="text-4xl font-bold mb-8 text-center md:text-left">
          Centros de acopio
        </h1>

        {/* --- Map Section --- */}
        <div className="w-full h-[400px] mb-10 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <p className="text-gray-500">Cargando mapa...</p>
            </div>
          ) : (
            <CustomMap centers={centers} />
          )}
        </div>
      
        {/* --- Why Register Section --- */}
        <section className="mb-10 text-center md:text-left">
          <h2 className="text-xl font-semibold mb-2">¿Por qué registrarte?</h2>
          <p className="text-gray-700 max-w-3xl">
            EcoColones conecta tu centro de acopio con una comunidad comprometida con el reciclaje,
            aumentando la recepción de materiales y mejorando tu visibilidad. Regístrate hoy para
            expandir tu alcance y contribuir a un futuro más verde y sostenible.
          </p>
        </section>

        {/* --- Forms Section --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* --- Registration Request --- */}
          <div className="bg-[#F7FCFA] border border-gray-200 rounded-xl p-8 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">¡Quiero unirme!</h3>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Correo</label>
                <input
                  type="email"
                  placeholder="Ingresa tu correo"
                  className="w-full bg-[#E6F2EA] rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">¿Por qué te quieres unir?</label>
                <textarea
                  placeholder="Cuéntanos brevemente..."
                  className="w-full bg-[#E6F2EA] rounded-md px-3 py-2 h-24 resize-none"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium rounded-md py-2"
              >
                Solicitar registro como centro de acopio
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
