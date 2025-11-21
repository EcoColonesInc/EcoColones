// Server Component
import { redirect } from "next/navigation";
import { AUTH_ROUTES } from "@/config/routes";
import { getUserData, calculateAge, getProfilePictureUrl, getUserClaimedPoints} from "@/lib/api/users";
import {getUserCenterTransactions} from "@/lib/api/transactions";
import {getMaterialConversionRates} from "@/lib/api/materials";
import {getDefaultCurrency} from "@/lib/api/currencies";
import UserDashboardClient from "./UserDashboardClient";

// --- Local types for server-side data mapping ---
type UserCenterTransaction = {
  user_name?: string;
  first_name?: string;
  last_name?: string;
  collection_center_name?: string;
  material_names?: string; // comma-separated list when aggregated by RPC
  total_points?: number;
  total_material_amount?: number; // aggregated amount
  transaction_code?: string;
  created_at?: string;
};

type TransactionRow = {
  id: string;
  center: string;
  material: string;
  qty: string;
  date: string;
  status?: string;
};

type ConversionRateApi = {
  material_id?: string;
  name?: string;
  equivalent_points?: number;
  unit_id?: { unit_id?: string; unit_name?: string } | null;
};

type ConversionRate = {
  material: string;
  points: number | string;
  unit?: string;
};

export default async function UserDashboard() {
  // Fetch user data using shared API logic
  const { data, error } = await getUserData();
  if (error || !data || data.length === 0) {
    redirect(AUTH_ROUTES.LOGIN);
  }
  const personData = data[0];

  const { data: transactionsData, error: transactionsError } = await getUserCenterTransactions();
  if (transactionsError) {
    redirect(AUTH_ROUTES.LOGIN);
  }
  
  const { data: conversionRatesData, error: conversionRatesError } = await getMaterialConversionRates();
  if (conversionRatesError) {
    redirect(AUTH_ROUTES.LOGIN);
  }
  
  const {data: currencyData, error: currencyError } = await getDefaultCurrency();
  if (currencyError || !currencyData) {
    redirect(AUTH_ROUTES.LOGIN);
  }
  // Extract currency name and value from possible shapes returned by the API/RPC
  const _currencyRow = Array.isArray(currencyData) ? currencyData[0] : currencyData;
  const currencyName = _currencyRow?.name ?? _currencyRow?.parameter ?? 'CRC';
  const currencyValue = _currencyRow?.value ?? _currencyRow?.parameter_value ?? 1;
  
  // Get claimed points
  const { data: claimedPoints, error: claimedError } = await getUserClaimedPoints(personData.user_id);
  const totalClaimed = claimedError ? 0 : (claimedPoints || 0);
  const availablePoints = (personData.acumulated_points || 0) - totalClaimed;
  
   // Construct user object with database data
  const userName = `${personData.first_name} ${personData.last_name} ${personData.second_last_name || ''}`.trim();
  const age = personData.birth_date ? calculateAge(personData.birth_date) : 0;
  const avatarUrl = await getProfilePictureUrl(personData.user_name);

  const user = {
    name: userName,
    gender: (function mapGender(g?: string | null) {
      if (!g) return "N/A";
      const v = String(g).toLowerCase();
      if (v === "male") return "Hombre";
      if (v === "female") return "Mujer";
      if (v === "other") return "Otro";
      return g;
    })(personData.gender),
    age: age,
    identification: personData.identification || "N/A",
    points: personData.acumulated_points,
    claimedPoints: totalClaimed,
    availablePoints: availablePoints,
    recycled: personData.material_recycled,
    rate: `1 = ${currencyValue} ${currencyName}`,
    avatar: avatarUrl,
  };

  // Map API transactions into the table format expected by the UI
  const _rawTransactions = (transactionsData as UserCenterTransaction[]) || [];

  const transactions: TransactionRow[] = (_rawTransactions && _rawTransactions.length > 0)
    ? _rawTransactions.map((t: UserCenterTransaction, idx: number) => ({
        // Prefer using the `transaction_code` returned by the RPC for a stable ID
        id: t.transaction_code ?? (t.created_at ? `TXN${new Date(t.created_at).getTime()}` : `TXN_FALLBACK_${idx}`),
        center: t.collection_center_name || "N/A",
        // RPC returns aggregated `material_names` (comma-separated) when multiple items
        material: t.material_names || "N/A",
        // Use aggregated total material amount when available
        qty: t.total_material_amount != null ? `${t.total_material_amount} kg` : "N/A",
        date: t.created_at
          ? new Date(t.created_at).toLocaleDateString("es-CR", { year: "numeric", month: "2-digit", day: "2-digit" })
          : "N/A",
      }))
    : [];

  // Map API `conversionRatesData` to the UI format.
  const _rawConversionRateData = (conversionRatesData as ConversionRateApi[]) || [];

  const conversionRates: ConversionRate[] = (_rawConversionRateData && _rawConversionRateData.length > 0)
    ? _rawConversionRateData.map((c: ConversionRateApi) => ({
        material: c.name || "N/A",
        points: c.equivalent_points != null ? c.equivalent_points : "N/A",
        unit: c.unit_id?.unit_name || "N/A",
      }))
    : [];

  return <UserDashboardClient user={user} transactions={transactions} conversionRates={conversionRates} />;
}
