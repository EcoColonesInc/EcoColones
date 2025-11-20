"use client";

import { useEffect, useState } from "react";
//import { useToast } from "@/components/ui/toast"; Preguntar sobre esto
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

type Material = {
  material_id?: string;
  name?: string;
  material_name?: string;
};

export default function CentersFromUser() {
  //const { showToast } = useToast();
  const [centers, setCenters] = useState<Center[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCenterId, setSelectedCenterId] = useState<string | number | null>(null);
  const [centerMaterials, setCenterMaterials] = useState<Record<string | number, Material[]>>({});

  useEffect(() => {
  let mounted = true;
  (async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/collectioncenters/get");
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "Error fetching centers");

      // Normalize response shape: the route returns the data directly (array)
      // in some handlers, or { data: [...] } in others. Accept both.
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
      //const message = err instanceof Error ? err.message : String(err);
      console.error("Error fetching centers:", err);
      //showToast(message ?? "Error cargando centros", "error");
    } finally {
      if (mounted) setIsLoading(false);
    }
  })();

  return () => {
    mounted = false;
  };
}, []);

  // Fetch materials for each center
  useEffect(() => {
    if (centers.length === 0) return;

    let mounted = true;
    (async () => {
      const materialsMap: Record<string | number, Material[]> = {};
      
      await Promise.all(
        centers.map(async (center) => {
          try {
            const res = await fetch(`/api/collectioncenterxmaterials/get?centerId=${center.collectioncenter_id}`);
            const body = await res.json();
            
            if (res.ok) {
              let materials: Material[] = [];
              if (Array.isArray(body)) {
                materials = body as Material[];
              } else if (body && typeof body === 'object' && 'data' in body) {
                materials = Array.isArray((body as { data?: unknown }).data) ? (body as { data?: unknown }).data as Material[] : [];
              }
              materialsMap[center.collectioncenter_id] = materials;
            }
          } catch (err) {
            console.error(`Error fetching materials for center ${center.collectioncenter_id}:`, err);
            materialsMap[center.collectioncenter_id] = [];
          }
        })
      );

      if (mounted) setCenterMaterials(materialsMap);
    })();

    return () => {
      mounted = false;
    };
  }, [centers]);


  return (
    <div className="min-h-screen bg-white py-10 px-6 md:px-16">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* --- Title --- */}
        <h1 className="text-4xl font-bold text-center md:text-left">
          Centros de acopio
        </h1>

        {/* --- Map Section --- */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Mapa de centros de acopio</h2>

          <div className="w-full h-[400px] mb-10 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
            {/* dynamic map using CustomMap component */}
            <CustomMap centers={centers} focusId={selectedCenterId} />
          </div>
        </section>

        {/* --- List Section --- */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Lista de centros de acopio</h2>
            <div className="text-sm text-gray-500">{isLoading ? "Cargando..." : `${centers.length} centros`}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {centers.length === 0 && !isLoading && (
              <p className="text-sm text-gray-500">No hay centros disponibles.</p>
            )}

            {centers.map((c) => {
              const materials = centerMaterials[c.collectioncenter_id] || [];
              
              return (
                <div
                  key={String(c.collectioncenter_id)}
                  onClick={() => setSelectedCenterId(c.collectioncenter_id)}
                  className={`p-4 rounded-md border border-gray-100 shadow-sm cursor-pointer ${selectedCenterId === c.collectioncenter_id ? 'bg-green-50 border-green-200' : 'bg-white'}`}
                >
                  <h3 className="font-semibold text-lg">{c.name ?? "Centro sin nombre"}</h3>
                  <p className="text-gray-700">Ubicación: {c.district_id?.district_name ?? "—"}</p>
                  <p className="text-gray-700">Número: {c.phone ?? "—"}</p>
                  <p className="text-gray-700">Responsable: {`${c.person_id?.first_name ?? ""} ${c.person_id?.last_name ?? ""}`.trim() || "—"}</p>
                  
                  {materials.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm font-semibold text-gray-800 mb-2">Materiales aceptados:</p>
                      <div className="flex flex-wrap gap-2">
                        {materials.map((material, idx) => (
                          <span
                            key={material.material_id || idx}
                            className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full"
                          >
                            {material.material_name || material.name || "Material"}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
