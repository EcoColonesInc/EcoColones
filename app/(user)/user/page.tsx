import Image from "next/image";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { AUTH_ROUTES } from "@/config/routes";

import { getUserData, calculateAge, getProfilePictureUrl, getUserCenterTransactions,
         getMaterialConversionRates, getDefaultCurrency
} from "@/lib/api/users";

// --- Local types to avoid `any` usage ---
type UserCenterTransaction = {
  user_name?: string;
  first_name?: string;
  last_name?: string;
  collection_center_name?: string;
  material_name?: string;
  total_points?: number;
  material_amount?: number;
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
  
   // Construct user object with database data
  const userName = `${personData.first_name} ${personData.last_name} ${personData.second_last_name || ''}`.trim();
  const age = personData.birth_date ? calculateAge(personData.birth_date) : 0;
  const avatarUrl = await getProfilePictureUrl(personData.user_name);

  const user = {
    name: userName,
    gender: personData.gender || "N/A",
    age: age,
    identification: personData.identification || "N/A",
    points: personData.acumulated_points,
    recycled: personData.material_recycled,
    rate: `1 = ${currencyValue} ${currencyName}`,
    avatar: avatarUrl,
  };

  // Map API transactions into the table format expected by the UI
  const _rawTransactions = (transactionsData as UserCenterTransaction[]) || [];

  const transactions: TransactionRow[] = (_rawTransactions && _rawTransactions.length > 0)
    ? _rawTransactions.map((t: UserCenterTransaction, idx: number) => ({
        // Create a stable-ish id from timestamp + index when no id provided by API
        id: t.created_at ? `TXN${new Date(t.created_at).getTime()}` : `TXN_FALLBACK_${idx}`,
        center: t.collection_center_name || "N/A",
        material: t.material_name || "N/A",
        qty: t.material_amount != null ? `${t.material_amount} kg` : "N/A",
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

  return (
    <div className="min-h-screen bg-[#F7FCFA] px-6 py-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* --- Top Profile Section --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="col-span-2 bg-white rounded-xl border border-gray-100 p-6 flex items-center justify-center">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Image
                src={user.avatar}
                alt="Foto de usuario"
                width={160}
                height={160}
                className="rounded-full object-cover"
              />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{user.name}</h2>
                <p className="text-sm text-gray-700 mt-2">Género: {user.gender}</p>
                <p className="text-sm text-gray-700">Edad: {user.age} años</p>
                <p className="text-sm text-gray-700">
                  Identificación: {user.identification}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col justify-between">
            <div>
              <p className="text-sm text-gray-600">Puntos acumulados:</p>
              <p className="text-xl font-semibold">{user.points}</p>

              <p className="text-sm text-gray-600 mt-3">Material reciclado:</p>
              <p className="text-xl font-semibold">{user.recycled}</p>

              <p className="text-sm text-gray-600 mt-3">Tipo de cambio:</p>
              <p className="text-xl font-semibold">{user.rate}</p>
            </div>

            <div className="flex flex-col gap-3 mt-6">
              <Button className="bg-green-600 hover:bg-green-700 text-white font-medium rounded-md py-2">
                Canjear
              </Button>
              <Button className="bg-green-100 hover:bg-green-200 text-green-700 font-medium rounded-md py-2">
                Calculadora de puntos
              </Button>
            </div>
          </div>
        </div>

        {/* --- Bottom Section --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transactions Table */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-800">Transacciones recientes</h3>
              <a href="#" className="text-sm text-green-600 hover:underline">
                Ver todas las transacciones
              </a>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-[#E9F4EE] text-gray-700 font-medium">
                  <tr>
                    <th className="py-2 px-3 rounded-tl-md">ID Transacción</th>
                    <th className="py-2 px-3">Centro</th>
                    <th className="py-2 px-3">Material</th>
                    <th className="py-2 px-3">Cantidad</th>
                    <th className="py-2 px-3 rounded-tr-md">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn: TransactionRow) => (
                    <tr
                      key={txn.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-2 px-3">{txn.id}</td>
                      <td className="py-2 px-3">{txn.center}</td>
                      <td className="py-2 px-3">{txn.material}</td>
                      <td className="py-2 px-3">{txn.qty}</td>
                      <td className="py-2 px-3">{txn.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Conversion Table */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-3">
              Conversión del peso a puntos
            </h3>
            <table className="w-full text-sm border-collapse">
              <thead className="bg-[#E9F4EE] text-gray-700 font-medium">
                <tr>
                  <th className="py-2 px-3 rounded-tl-md">Material</th>
                  <th className="py-2 px-3 rounded-tr-md">Puntos por Peso (CRC)</th>
                </tr>
              </thead>
              <tbody>
                {conversionRates.map((row: ConversionRate) => (
                  <tr key={row.material} className="border-b border-gray-100">
                    <td className="py-2 px-3">{row.material}</td>
                    <td className="py-2 px-3">{row.points} pts {row.unit ? ` / ${row.unit}` : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}