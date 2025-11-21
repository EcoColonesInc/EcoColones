import UserDetailClient from "@/app/(admin)/admin/consultas/user/[id]/UserDetailClient";
import { getProfileInfoByUserId } from "@/lib/api/persons";

export const revalidate = 0;

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: userId } = await params;

  const profileRes = await getProfileInfoByUserId(userId);

  const rawProfile = Array.isArray(profileRes.data)
    ? profileRes.data[0]
    : profileRes.data;

  return (
    <UserDetailClient userId={userId} initialProfile={rawProfile ?? null} />
  );
}


