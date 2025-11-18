import { getBinnacle } from "@/lib/api/binnacles";
import { getUsersWithMostRecycled } from "@/lib/api/users";
import AuditoriaClient from "./AuditoriaClient";

export default async function AdminAuditoriaPage() {
  const [binnaclesRes, recyclingsRes] = await Promise.all([
    getBinnacle(),
    getUsersWithMostRecycled(),
  ]);
  return (
    <AuditoriaClient
      initialBinnacles={(binnaclesRes.data ?? []) as unknown[]}
      initialRecyclings={(recyclingsRes.data ?? []) as unknown[]}
    />
  );
}
