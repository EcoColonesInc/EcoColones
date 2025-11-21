"use client";

import { Modal } from "@/components/ui/modal";

interface RequestDetailsModalProps {
  open: boolean;
  onCancel: () => void;
  onAccept: () => void;
  onReject: () => void;
  centerName: string;
  description: string;
}

export default function RequestDetailsModal({
  open,
  onCancel,
  onAccept,
  onReject,
  centerName,
  description,
}: RequestDetailsModalProps) {
  return (
    <Modal
      open={open}
      title={`Solicitud de:  ${centerName}`}
      onCancel={onCancel}
      onConfirm={onAccept}
      confirmText="Aceptar"
      cancelText="Cancelar"
      className="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Request Text */}
        <p className="text-gray-800 leading-relaxed whitespace-pre-line">
          {description}
        </p>

        {/* Extra RECHAZAR button */}
        <div className="flex justify-center gap-4 pt-4">
          <button
            onClick={onReject}
            className="bg-red-500 hover:bg-red-600 text-white px-8 py-2 rounded-md shadow-sm"
          >
            Rechazar
          </button>
        </div>
      </div>
    </Modal>
  );
}
