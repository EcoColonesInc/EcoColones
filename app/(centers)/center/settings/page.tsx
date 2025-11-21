"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Material {
  material_id: string;
  name: string;
  equivalent_points?: number;
}

interface CenterMaterial {
  collection_center_x_product_id: string;
  material_name: string;
  collection_center_name: string;
  unit_name?: string;
  unit_exchange?: number;
}

export default function CenterSettingsPage() {
  const [collectionCenterId, setCollectionCenterId] = useState<string | null>(null);
  const [collectionCenterName, setCollectionCenterName] = useState<string | null>(null);
  const [allMaterials, setAllMaterials] = useState<Material[]>([]);
  const [centerMaterials, setCenterMaterials] = useState<CenterMaterial[]>([]);
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Get the user's collection center
        const centerResponse = await fetch('/api/collectioncenters/get/user');
        if (!centerResponse.ok) {
          throw new Error('Error al obtener el centro de acopio');
        }
        const centerData = await centerResponse.json();

        if (!centerData?.collectioncenter_id) {
          throw new Error('No se encontró el centro de acopio del usuario');
        }

        const centerId = centerData.collectioncenter_id;
        const centerName = centerData.name || centerData.collectioncenter_name;
        setCollectionCenterId(centerId);
        setCollectionCenterName(centerName);

        // Fetch all available materials
        const materialsResponse = await fetch('/api/materials/get');
        if (!materialsResponse.ok) {
          throw new Error('Error al obtener los materiales disponibles');
        }
        const materialsData = await materialsResponse.json();
        setAllMaterials(materialsData || []);

        // Fetch materials accepted by this collection center
        const centerMaterialsResponse = await fetch(`/api/collectioncenters/${centerId}/collectioncenterxmaterials/get`);
        if (!centerMaterialsResponse.ok) {
          throw new Error('Error al obtener los materiales del centro');
        }
        const centerMaterialsData = await centerMaterialsResponse.json();
        setCenterMaterials(centerMaterialsData || []);

        // Build the set of currently selected material IDs
        const selectedIds = new Set<string>();
        const centerMaterialNames = new Set(
          (centerMaterialsData || []).map((cm: CenterMaterial) => cm.material_name)
        );

        (materialsData || []).forEach((mat: Material) => {
          if (centerMaterialNames.has(mat.name)) {
            selectedIds.add(mat.material_id);
          }
        });

        setSelectedMaterialIds(selectedIds);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const toggleMaterial = (materialId: string) => {
    setSelectedMaterialIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(materialId)) {
        newSet.delete(materialId);
      } else {
        newSet.add(materialId);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    if (!collectionCenterId || !collectionCenterName) {
      setError('No se encontró la información del centro de acopio');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Determine which materials to add and which to remove
      const currentMaterialNames = new Set(
        centerMaterials.map(cm => cm.material_name)
      );

      const selectedMaterials = allMaterials.filter(m => 
        selectedMaterialIds.has(m.material_id)
      );
      const selectedMaterialNames = new Set(selectedMaterials.map(m => m.name));

      const toAdd = selectedMaterials.filter(m => !currentMaterialNames.has(m.name));
      const toRemove = centerMaterials.filter(cm => !selectedMaterialNames.has(cm.material_name));

      // Add new materials
      for (const material of toAdd) {
        const response = await fetch('/api/collectioncenterxmaterials/post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            material_name: material.name,
            collection_center_name: collectionCenterName,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.warn(`Error adding ${material.name}:`, errorData.error);
        }
      }

      // Remove materials
      for (const material of toRemove) {
        const response = await fetch('/api/collectioncenterxmaterials/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            material_name: material.material_name,
            collection_center_id: collectionCenterId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.warn(`Error removing ${material.material_name}:`, errorData.error);
        }
      }

      setSuccess(
        `Cambios guardados correctamente. ${toAdd.length > 0 ? `+${toAdd.length} agregado(s)` : ''} ${toRemove.length > 0 ? `-${toRemove.length} eliminado(s)` : ''}`
      );

      // Refresh the center materials list
      const centerMaterialsResponse = await fetch(
        `/api/collectioncenters/${collectionCenterId}/collectioncenterxmaterials/get`
      );
      if (centerMaterialsResponse.ok) {
        const centerMaterialsData = await centerMaterialsResponse.json();
        setCenterMaterials(centerMaterialsData || []);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = () => {
    const currentMaterialNames = new Set(
      centerMaterials.map(cm => cm.material_name)
    );
    const selectedMaterials = allMaterials.filter(m => 
      selectedMaterialIds.has(m.material_id)
    );
    const selectedMaterialNames = new Set(selectedMaterials.map(m => m.name));

    if (currentMaterialNames.size !== selectedMaterialNames.size) {
      return true;
    }

    for (const name of currentMaterialNames) {
      if (!selectedMaterialNames.has(name)) {
        return true;
      }
    }

    return false;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8 text-gray-500">Cargando configuración...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <main className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Configuración del Centro de Acopio</h1>
          <h2 className="text-2xl font-semibold mb-2 text-green-600">{collectionCenterName}</h2>
          <p className="text-gray-600">
            Selecciona los materiales que tu centro de acopio puede recibir
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Materiales Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {allMaterials.map((material) => {
                const isSelected = selectedMaterialIds.has(material.material_id);
                return (
                  <div
                    key={material.material_id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-green-50 border-green-500 shadow-md'
                        : 'bg-white border-gray-200 hover:border-green-300 hover:shadow'
                    }`}
                    onClick={() => toggleMaterial(material.material_id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{material.name}</h3>
                        {material.equivalent_points !== undefined && (
                          <p className="text-sm text-gray-600">
                            {material.equivalent_points} pts/kg
                          </p>
                        )}
                      </div>
                      <div className="ml-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleMaterial(material.material_id)}
                          className="h-5 w-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {isSelected ? '✓ Aceptado' : 'Click para aceptar'}
                    </div>
                  </div>
                );
              })}
            </div>

            {allMaterials.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No hay materiales disponibles
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {selectedMaterialIds.size} material(es) seleccionado(s)
          </div>
          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges()}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>

        {!hasChanges() && selectedMaterialIds.size > 0 && (
          <div className="mt-4 text-sm text-gray-500 text-right">
            No hay cambios pendientes
          </div>
        )}
      </main>
    </div>
  );
}
