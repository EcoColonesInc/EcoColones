import StatsClient from './stats-client';

interface Params { id: string }

// Tipo mínimo compartido para evitar 'any'
export type InitialTransaction = {
  person_id?: { user_name?: string; first_name?: string; last_name?: string } | null;
  collection_center_id?: { name?: string } | null;
  material_id?: { name?: string; equivalent_points?: number | null } | null;
  total_points?: number | null;
  material_amount?: number | string | null;
  created_at?: string | null;
};

export default async function Page(context: { params: Promise<Params> }) {
  const { id } = await context.params;
  let initial: InitialTransaction[] = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/collectioncenters/${id}/collectioncentertransactions/get`, { cache: 'no-store' });
    if (res.ok) {
      initial = await res.json();
    }
  } catch { /* ignorar error inicial */ }
  return <StatsClient centerId={id} initialTransactions={initial} />;
}
