"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal"; // your modal component

type CenterRequest = {
  id: number;
  name: string;
  email: string;
  description?: string;
};

export default function AdminCenterRequests() {
  const [requests, setRequests] = useState<CenterRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CenterRequest | null>(
    null
  );

  useEffect(() => {
    // Hardcoded requests for testing
    const hardcoded: CenterRequest[] = [
      {
        id: 1,
        name: "Centro de acopio de Limón",
        email: "calimonoficial@gmail.com",
        description: `
Solicito formalmente la incorporación de nuestra entidad al sistema de gestión ambiental EcoColones, con el fin de operar como centro recolector autorizado de materiales reciclables.

Nuestro centro cuenta con la infraestructura, personal y procedimientos adecuados para la recepción, clasificación y almacenamiento temporal de materiales valorizables tales como papel, cartón, plástico, vidrio, aluminio y desechos electrónicos. Asimismo, nos comprometemos a cumplir con las políticas y lineamientos establecidos por el programa, garantizando un manejo responsable y transparente de los residuos recolectados.

El objetivo principal de esta solicitud es contribuir activamente a la economía circular y a la reducción del impacto ambiental, promoviendo la participación comunitaria a través del intercambio de materiales por puntos ecológicos y beneficios sostenibles, según las directrices del sistema EcoColones.
        `,
      },
      {
        id: 2,
        name: "Centro de acopio de Alajuela",
        email: "caalajuelaoficial@gmail.com",
        description:
          "Solicitud breve: Nuestro centro desea unirse a EcoColones por motivos ambientales y de economía circular.",
      },
    ];

    // Use hardcoded for now
    setRequests(hardcoded);
    setLoading(false);
  }, []);

  // Open modal with selected request
  const openModal = (req: CenterRequest) => {
    setSelectedRequest(req);
    setModalOpen(true);
  };

  // Modal actions
  const handleAccept = () => {
    setModalOpen(false);
    window.location.href = "centers/form";
  };

  /*const handleReject = () => {
    setModalOpen(false);
  };*/

  return (
    <div className="min-h-screen bg-white px-6 md:px-16 py-10">
      {/* --- Header --- */}
      <h1 className="text-4xl font-bold mb-2">
        Solicitudes de ingreso para centros de acopio
      </h1>
      <p className="text-gray-600 mb-10 max-w-2xl">
        ¡Bienvenido! Rechaza o acepta las diversas solicitudes de ingreso de los
        centros de acopio desde aquí
      </p>

      {/* --- Table Container --- */}
      <div className="bg-[#F7FCFA] border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">
            Tabla de información de las solicitudes de ingreso
          </h3>

          <Link href="/admin/centers/requests/all">
            <span className="text-sm text-green-700 font-medium cursor-pointer hover:underline">
              Ver Todas
            </span>
          </Link>
        </div>

        {/* Header Row */}
        <div className="grid grid-cols-4 font-semibold text-gray-700 text-sm pb-3 border-b">
          <div>ID</div>
          <div>Nombre del centro de acopio</div>
          <div>Correo</div>
          <div>Solicitud</div>
        </div>

        {/* Data Rows */}
        <div className="divide-y">
          {loading && (
            <p className="text-gray-500 text-sm py-4">Cargando solicitudes...</p>
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

                <div>
                  <Button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-md px-4 py-1"
                    onClick={() => openModal(req)}
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

        {/* An extra button row for "Cancelar" as shown in your mockup */}
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
