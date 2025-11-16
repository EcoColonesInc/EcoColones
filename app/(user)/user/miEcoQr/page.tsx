"use client";

import QRCode from "react-qr-code";

import { useAuth } from "@/contexts/AuthProvider";
import { useEffect, useMemo, useState } from "react";

export default function MiEcoQR() {
  const { user: authUser } = useAuth();
  const [identification, setIdentification] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!authUser?.id) return;
      try {
        const res = await fetch(`/api/persons/${authUser.id}/get`);
        const body = await res.json();
        if (!res.ok) {
          console.error('Error fetching person', body?.error);
          return;
        }
        const data = Array.isArray(body?.data) ? body.data[0] ?? null : body?.data ?? null;
        if (!mounted) return;
        const idValue = data?.identification ?? null;
        setIdentification(idValue ? String(idValue) : null);
      } catch (err: unknown) {
        console.error('Error loading person identification', err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [authUser?.id]);

  const qrValue = useMemo(() => {
    // Prefer the person.identification field; fall back to auth user id
    if (identification) return identification;
    return "";
  }, [identification]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center">
      {/* QR Code */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        {qrValue ? (
          <QRCode value={qrValue} size={260} bgColor="#FFFFFF" fgColor="#000000" level="Q" />
        ) : (
          <div className="w-[260px] h-[260px] flex items-center justify-center text-sm text-gray-500">Inicia sesión para ver tu QR</div>
        )}
      </div>

      {/* Instruction text */}
      <p className="mt-6 text-lg font-medium text-gray-800 max-w-md">
        Presenta este <span className="font-semibold">QR</span> en el centro de acopio.
      </p>
      {qrValue && (
        <p className="mt-3 text-sm text-gray-500">Identificación: <span className="font-medium">{qrValue}</span></p>
      )}
    </div>
  );
}
