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
        console.log('Fetched person data:', body);
        // Normalize API response shapes: some routes return the data directly
        // (e.g. an array from an RPC) while others wrap it as { data: ... }
        let data: Record<string, unknown> | null = null;
        if (Array.isArray(body)) {
          const first = body[0];
          if (first && typeof first === 'object') data = first as Record<string, unknown>;
        } else if (body && typeof body === 'object' && 'data' in body) {
          const field = (body as { data?: unknown }).data;
          if (Array.isArray(field)) {
            const first = field[0];
            if (first && typeof first === 'object') data = first as Record<string, unknown>;
          } else if (field && typeof field === 'object') {
            data = field as Record<string, unknown>;
          }
        } else if (body && typeof body === 'object') {
          data = body as Record<string, unknown>;
        }

        if (!mounted) return;
        const rawId = data && 'identification' in data ? data['identification'] : null;
        const idValue = (typeof rawId === 'string' || typeof rawId === 'number') ? String(rawId) : null;
        setIdentification(idValue);
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

