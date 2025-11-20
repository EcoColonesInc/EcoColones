"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Profile {
  first_name?: string | null;
  last_name?: string | null;
  second_last_name?: string | null;
  user_name?: string | null;
  birth_date?: string | null;
  identification?: string | null;
  document_type?: string | null;
  gender?: string | null;
  telephone_number?: string | null;
  email?: string | null;
  acumulated_points?: number | null;
  material_recycled?: number | null;
  district_name?: string | null;
  city_name?: string | null;
  province_name?: string | null;
  country_name?: string | null;
}

interface UserDetailClientProps {
  userId: string;
  initialProfile: Profile | null;
}

function formatDate(input?: string | null) {
  if (!input) return "-";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return d.toLocaleDateString("es-CR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function UserDetailClient({ initialProfile }: UserDetailClientProps) {
  const router = useRouter();
  const [profile] = useState<Profile | null>(initialProfile);
  const points = profile?.acumulated_points ?? 0;
  const materialKg = profile?.material_recycled ?? 0;
  const email = profile?.email ?? "";
  const [avatarUrl, setAvatarUrl] = useState<string>("/logo.png");
  const [loading] = useState<boolean>(false);
  const [error] = useState<string | null>(null);

  // Resolve avatar from storage
  useEffect(() => {
    const username = profile?.user_name;
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!username || !base) return;
    const exts = ["png", "jpg", "jpeg", "webp"];
    (async () => {
      for (const ext of exts) {
        const candidate = `${base}/storage/v1/object/public/profile_pictures/${username}.${ext}`;
        try {
          await new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = reject;
            img.src = candidate;
          });
          setAvatarUrl(candidate);
          break;
        } catch {
          /* continue */
        }
      }
    })();
  }, [profile]);

  // Si en el futuro se quiere refrescar manualmente, se puede reintroducir una función dedicada.

  const fullName = useMemo(() => {
    if (!profile) return "-";
    return (
      [profile.first_name, profile.last_name, profile.second_last_name]
        .filter(Boolean)
        .join(" ") || "-"
    );
  }, [profile]);

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-12 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Perfil de usuario</h1>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => router.push("/admin/consultas/user")}
          >
            Volver
          </Button>
               {/* Botón de refrescar eliminado según requerimiento */}
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl}
              alt="avatar"
              className="h-10 w-10 rounded-full object-cover border"
            />
            <span>{fullName}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Field label="Nombre de Usuario" value={profile?.user_name} />
              <Field label="Correo" value={email} />
              <Field
                label="Tipo de identificación"
                value={profile?.document_type}
              />
              <Field label="Identificación" value={profile?.identification} />
              <Field
                label="Fecha de nacimiento"
                value={formatDate(profile?.birth_date)}
              />
            </div>
            <div className="space-y-4">
              <Field
                label="Puntos Acumulados"
                value={String(points)}
                loading={loading}
              />
              <Field label="Material Reciclado" value={`${materialKg} kg`} />
              <Field label="Género" value={profile?.gender} />
              <Field label="Teléfono" value={profile?.telephone_number} />
            </div>
          </div>
          <div className="mt-6">
            <Button
              variant="destructive"
              onClick={() => router.push("/admin/consultas")}
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  value,
  loading,
}: {
  label: string;
  value?: string | null;
  loading?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        className="w-full border rounded px-3 py-2 bg-muted"
        readOnly
        value={loading ? "…" : value ?? "-"}
      />
    </div>
  );
}
