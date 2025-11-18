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
}

interface UserDetailClientProps {
  userId: string;
  initialProfile: Profile | null;
  initialPoints: number;
  initialMaterialKg: number;
  initialEmail: string;
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

export default function UserDetailClient({
  userId,
  initialProfile,
  initialPoints,
  initialMaterialKg,
  initialEmail,
}: UserDetailClientProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [points, setPoints] = useState<number>(initialPoints);
  const [materialKg, setMaterialKg] = useState<number>(initialMaterialKg);
  const [email, setEmail] = useState<string>(initialEmail);
  const [avatarUrl, setAvatarUrl] = useState<string>("/logo.png");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  // Optional manual refresh (could be triggered by a button in future)
  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [pRes, ptsRes, txRes, emailRes] = await Promise.all([
        fetch(`/api/persons/${userId}/get`, { cache: "no-store" }),
        fetch(`/api/persons/${userId}/points/get`, { cache: "no-store" }),
        fetch(`/api/persons/${userId}/collectioncentertransactions/get`, {
          cache: "no-store",
        }),
        fetch(`/api/persons/${userId}/email/get`, { cache: "no-store" }),
      ]);
      const [pJ, ptsJ, txJ, eJ] = await Promise.all([
        pRes.json(),
        ptsRes.json(),
        txRes.json(),
        emailRes.json(),
      ]);
      if (!pRes.ok) throw new Error(pJ?.error || "Error cargando perfil");
      if (!ptsRes.ok) throw new Error(ptsJ?.error || "Error cargando puntos");
      if (!txRes.ok)
        throw new Error(txJ?.error || "Error cargando transacciones");
      if (!emailRes.ok) throw new Error(eJ?.error || "Error cargando correo");
      const profRaw = Array.isArray(pJ?.data) ? pJ.data[0] : pJ?.data;
      setProfile(profRaw as Profile);
      const ptsData = Array.isArray(ptsJ?.data) ? ptsJ.data[0] : ptsJ?.data;
      const pAmount = ptsData?.point_amount;
      setPoints(
        typeof pAmount === "string" ? Number(pAmount) : Number(pAmount || 0)
      );
      const txs = (txJ?.data ?? []) as Array<{
        material_amount?: number | string | null;
      }>;
      const sum = txs.reduce(
        (acc, row) =>
          acc +
          (typeof row.material_amount === "string"
            ? Number(row.material_amount)
            : Number(row.material_amount || 0)),
        0
      );
      setMaterialKg(sum);
      setEmail(eJ?.data?.email ?? "-");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

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
            onClick={() => router.push("/admin/consultas")}
          >
            Volver
          </Button>
          <Button variant="outline" disabled={loading} onClick={refresh}>
            Refrescar
          </Button>
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
