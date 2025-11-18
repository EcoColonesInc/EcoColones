import UserDetailClient from "./UserDetailClient";
import { getProfileInfoByUserId, getEmailByUserId } from "@/lib/api/persons";
import { getPointsByUserId } from "@/lib/api/users";
import { createClient } from "@/utils/supabase/server";

export const revalidate = 0;

export default async function AdminUserDetailPage({ params }: { params: { id: string } }) {
  const userId = params.id;

  const [profileRes, pointsRes, emailRes, materialRes] = await Promise.all([
    getProfileInfoByUserId(userId),
    getPointsByUserId(userId),
    getEmailByUserId(userId),
    getMaterialTransactions(userId),
  ]);

  const rawProfile = Array.isArray(profileRes.data) ? profileRes.data[0] : profileRes.data;
  const rawPointsArr = Array.isArray(pointsRes.data) ? pointsRes.data : pointsRes.data ? [pointsRes.data] : [];
  // pointsRes returns array of rows with point_amount
  const pointAmount = rawPointsArr.length ? normalizeNumber((rawPointsArr[0] as any).point_amount) : 0;
  const materialKg = (materialRes.data ?? []).reduce((acc: number, row: any) => acc + normalizeNumber(row.material_amount), 0);
  const email = emailRes.data?.email ?? "-";

  return (
    <UserDetailClient
      userId={userId}
      initialProfile={rawProfile ?? null}
      initialPoints={pointAmount}
      initialMaterialKg={materialKg}
      initialEmail={email}
    />
  );
}

function normalizeNumber(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

async function getMaterialTransactions(userId: string) {
  // Direct lightweight query; if needed move to lib/api later.
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collectioncentertransaction")
    .select("material_amount")
    .eq("person_id", userId);
  if (error) return { error: error.message, data: [] as any[] };
  return { error: null, data };
}
