import { Suspense } from "react";
import StatsContent from "./StatsContent";
import {
  statsUsersByAgeRanges,
  statsAffiliatedByType,
  statsProductsRedeemedByYear,
  statsProductsRedeemedByMonth,
  getPointsSummary,
} from "@/lib/api/statistics";

async function LoadStats() {
  const currentYear = new Date().getFullYear();

  // Fetch all statistics in parallel
  const [ageResult, businessResult, yearResult, monthResult, topUsersResult] = await Promise.all([
    statsUsersByAgeRanges(),
    statsAffiliatedByType(),
    statsProductsRedeemedByYear(),
    statsProductsRedeemedByMonth(currentYear),
    getPointsSummary(),
  ]);

  // Check for errors
  if (ageResult.error) throw new Error(`Age data: ${ageResult.error}`);
  if (businessResult.error) throw new Error(`Business data: ${businessResult.error}`);
  if (yearResult.error) throw new Error(`Year data: ${yearResult.error}`);
  if (monthResult.error) throw new Error(`Month data: ${monthResult.error}`);
  if (topUsersResult.error) throw new Error(`Top users data: ${topUsersResult.error}`);

  // Sort top users by total points descending
  const sortedUsers = (topUsersResult.data || []).sort(
    (a, b) => Number(b.total_points || 0) - Number(a.total_points || 0)
  );

  return (
    <StatsContent
      ageData={ageResult.data || []}
      businessData={businessResult.data || []}
      yearData={yearResult.data || []}
      initialMonthData={monthResult.data || []}
      topUsersData={sortedUsers}
      initialYear={currentYear}
    />
  );
}

export default function ReportsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Estadísticas</h1>
        <p className="text-gray-600 mt-2">Visualización de métricas y datos del sistema</p>
      </div>
      <Suspense fallback={<div className="text-center py-12">Cargando estadísticas...</div>}>
        <LoadStats />
      </Suspense>
    </div>
  );
}
