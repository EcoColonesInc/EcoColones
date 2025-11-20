"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

type AffiliateRequest = {
  id: number;
  name: string;
  email: string;
  description: string;
};

export default function AdminAffiliateRequests() {
  const [requests, setRequests] = useState<AffiliateRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AffiliateRequest | null>(null);

  useEffect(() => {
    // Hardcoded test data (with descriptions)
    const hardcoded: AffiliateRequest[] = [
      {
        id: 1,
        name: "Tienda Eco Verde",
        email: "eco.verde@gmail.com",
        description: `Solicito formalmente la incorporación de mi comercio al programa EcoColones,
con el fin de incentivar el consumo sostenible por medio del canje de puntos y la promoción 
de productos ecológicos.

Nuestra tienda ofrece artículos biodegradables, productos reutilizables, kits de reciclaje
y artículos elaborados con materiales recuperados de centros de acopio aliados.

El objetivo principal es promover hábitos de consumo responsables y fomentar la economía circular.`,
      },
      {
        id: 2,
        name: "Supermercado El Ahorro",
        email: "el.ahorro@gmail.com",
        description: `Solicitamos unirnos al sistema EcoColones para ofrecer incentivos sostenibles
a nuestros clientes. El supermercado cuenta con secciones dedicadas a productos verdes,
reutilizables y reciclados.

Además, buscamos apoyar iniciativas de reducción de residuos y participación comunitaria.`,
      },
      {
        id: 3,
        name: "Restaurante Vegalife",
        email: "vegalife@gmail.com",
        description: `Nuestro restaurante desea integrarse a EcoColones para promover prácticas
sostenibles mediante descuentos ecológicos y el uso de empaques biodegradables.

Buscamos formar parte de una red de comercios conscientes que apoyan el reciclaje.`,
      },
    ];

    setLoading(true);
    setTimeout(() => {
      setRequests(hardcoded);
      setLoading(false);
    }, 600);
  }, []);

  const handleOpenModal = (request: AffiliateRequest) => {
    setSelectedRequest(request);
    setModalOpen(true);
  };

  const handleAccept = () => {
    window.location.href = "affiliates/form";
    setModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-white px-6 md:px-16 py-10">
      {/* --- Header --- */}
      <h1 className="text-4xl font-bold mb-2">
        Solicitudes de ingreso para comercios afiliados
      </h1>
      <p className="text-gray-600 mb-10 max-w-2xl">
        ¡Bienvenido! Rechaza o acepta las diversas solicitudes de ingreso de los
        comercios afiliados desde aquí
      </p>

      {/* --- Table Container --- */}
      <div className="bg-[#F7FCFA] border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">
            Tabla de información de las solicitudes de ingreso
          </h3>

          <span className="text-sm text-green-700 font-medium cursor-pointer hover:underline">
            Ver Todas
          </span>
        </div>

        {/* Header Row */}
        <div className="grid grid-cols-4 font-semibold text-gray-700 text-sm pb-3 border-b">
          <div>ID</div>
          <div>Nombre del comercio afiliado</div>
          <div>Correo</div>
          <div>Solicitud</div>
        </div>

        {/* Data Rows */}
        <div className="divide-y">
          {loading && (
            <p className="text-gray-500 text-sm py-4">Cargando solicitudes...</p>
          )}

          {!loading && requests.length === 0 && (
            <p className="text-gray-500 text-sm py-4">
              No hay solicitudes pendientes.
            </p>
          )}

          {!loading &&
            requests.map((req) => (
              <div
                key={req.id}
                className="grid grid-cols-4 items-center py-4 text-sm"
              >
                <div>{req.id}</div>

                <div className="font-medium">{req.name}</div>

                <div className="text-gray-700">{req.email}</div>

                <div className="flex justify-start">
                  <Button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-md px-4 py-1"
                    onClick={() => handleOpenModal(req)}
                  >
                    Ver Solicitud
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* --- Modal --- */}
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onConfirm={handleAccept}
        confirmText="Aceptar"
        cancelText="Rechazar"
      >
        <h2 className="text-xl font-semibold text-center mb-4">
          Solicitud de: {selectedRequest?.name}
        </h2>

        <p className="text-gray-700 whitespace-pre-line leading-relaxed">
          {selectedRequest?.description}
        </p>

        {/* Extra "Cancelar" button like the mockup */}
        <div className="flex justify-center mt-4">
          <Button
            variant="secondary"
            className="bg-gray-300 hover:bg-gray-400 text-black px-6"
            onClick={() => setModalOpen(false)}
          >
            Cancelar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
