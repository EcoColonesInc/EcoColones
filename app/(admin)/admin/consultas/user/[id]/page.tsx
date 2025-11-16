"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ProfileInfo = {
  user_id?: string;
  first_name?: string | null;
  last_name?: string | null;
  second_last_name?: string | null;
  user_name?: string | null; // usamos como correo
  document_type?: string | null;
  identification?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  telephone_number?: string | null;
};

type PointsInfo = { point_amount?: number | string | null } | null;

type CCTxMaterial = { material_amount?: number | string | null };
type CCTxAmountRecycle = { amount_recycle?: number | string | null };
type CCTx = (CCTxMaterial | CCTxAmountRecycle) & Record<string, unknown>;

function txAmount(row: CCTx): number {
  if ("material_amount" in row) {
    const v = row.material_amount;
    return typeof v === "string" ? Number(v) : Number(v || 0);
  }
  if ("amount_recycle" in row) {
    const v = row.amount_recycle;
    return typeof v === "string" ? Number(v) : Number(v || 0);
  }
  return 0;
}

function formatDate(input?: string | null) {
  if (!input) return "-";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return d.toLocaleDateString("es-CR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileInfo | null>(null);
  const [points, setPoints] = useState<number>(0);
  const [materialKg, setMaterialKg] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("/logo.png");
  const [email, setEmail] = useState<string>("-");

  useEffect(() => {
    let active = true;
    async function load() {
      if (!id) return;
      setLoading(true);
      try {
        const [pRes, ptsRes, txRes, emailRes] = await Promise.all([
          fetch(`/api/persons/${id}/get`, { cache: "no-store" }),
          fetch(`/api/persons/${id}/points/get`, { cache: "no-store" }),
          fetch(`/api/persons/${id}/collectioncentertransactions/get`, { cache: "no-store" }),
          fetch(`/api/persons/${id}/email/get`, { cache: "no-store" }),
        ]);

        const [pJ, ptsJ, txJ, eJ] = await Promise.all([pRes.json(), ptsRes.json(), txRes.json(), emailRes.json()]);
        if (!pRes.ok) throw new Error(pJ?.error || "Error cargando el perfil");
        if (!ptsRes.ok) throw new Error(ptsJ?.error || "Error cargando puntos");
        if (!txRes.ok) throw new Error(txJ?.error || "Error cargando transacciones");
        if (!emailRes.ok) throw new Error(eJ?.error || "Error cargando correo");

        // Perfil: el RPC puede devolver array; tomamos la primera fila
        const prof = Array.isArray(pJ?.data) ? pJ.data[0] : pJ?.data;
        if (active) setProfile(prof as ProfileInfo);

        // Intentar resolver avatar desde Storage: profile_pictures/<username>.(png|jpg|jpeg|webp)
        const username = (prof as ProfileInfo)?.user_name;
        const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (username && base) {
          const exts = ["png", "jpg", "jpeg", "webp"];
          for (const ext of exts) {
            const candidate = `${base}/storage/v1/object/public/profile_pictures/${username}.${ext}`;
            try {
              // Probar carga de imagen creando un objeto Image
              await new Promise<void>((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve();
                img.onerror = reject;
                img.src = candidate;
              });
              if (active) setAvatarUrl(candidate);
              break;
            } catch {
              // probar siguiente extensión
            }
          }
        }

        // Puntos
  const rawPts: PointsInfo = ptsJ?.data ?? null;
  const amount = rawPts ? (typeof rawPts.point_amount === "string" || typeof rawPts.point_amount === "number" ? rawPts.point_amount : 0) : 0;
        const nPoints = typeof amount === "string" ? Number(amount) : Number(amount || 0);
        if (active) setPoints(Number.isFinite(nPoints) ? nPoints : 0);

        // Material reciclado (kg)
        const txs: CCTx[] = (txJ?.data ?? []) as CCTx[];
        const sum = txs.reduce((acc, row) => acc + (Number.isFinite(txAmount(row)) ? txAmount(row) : 0), 0);
        if (active) setMaterialKg(sum);

        // Email
        const userEmail = eJ?.data?.email ?? "-";
        if (active) setEmail(userEmail || "-");

        if (active) setError(null);
      } catch (e: unknown) {
        if (active) setError(e instanceof Error ? e.message : "Error inesperado");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [id]);

  const fullName = useMemo(() => {
    if (!profile) return "-";
    return [profile.first_name, profile.last_name, profile.second_last_name].filter(Boolean).join(" ") || "-";
  }, [profile]);

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-12 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Perfil de usuario</h1>
        <Button variant="secondary" onClick={() => router.push("/admin/consultas")}>Volver</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatarUrl} alt="avatar" className="h-10 w-10 rounded-full object-cover border" />
            <span>{fullName}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna izquierda */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre de Usuario</label>
                <input className="w-full border rounded px-3 py-2 bg-muted" readOnly value={profile?.user_name ?? "-"} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Correo</label>
                <input className="w-full border rounded px-3 py-2 bg-muted" readOnly value={email} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de identificación</label>
                <input className="w-full border rounded px-3 py-2 bg-muted" readOnly value={profile?.document_type ?? "-"} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Identificación</label>
                <input className="w-full border rounded px-3 py-2 bg-muted" readOnly value={profile?.identification ?? "-"} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fecha de nacimiento</label>
                <input className="w-full border rounded px-3 py-2 bg-muted" readOnly value={formatDate(profile?.birth_date)} />
              </div>
            </div>

            {/* Columna derecha */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Puntos Acumulados</label>
                <input className="w-full border rounded px-3 py-2 bg-muted" readOnly value={loading ? "…" : String(points)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Material Reciclado</label>
                <input className="w-full border rounded px-3 py-2 bg-muted" readOnly value={`${materialKg} kg`} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Género</label>
                <input className="w-full border rounded px-3 py-2 bg-muted" readOnly value={profile?.gender ?? "-"} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Teléfono</label>
                <input className="w-full border rounded px-3 py-2 bg-muted" readOnly value={profile?.telephone_number ?? "-"} />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button variant="destructive" onClick={() => router.push("/admin/consultas")}>Cancelar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
