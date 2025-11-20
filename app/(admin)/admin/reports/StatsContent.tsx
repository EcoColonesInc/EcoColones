"use client";

import { useState, useTransition } from "react";
import { StatCard } from "@/components/admin/stats/StatCard";
import { AgeRangeBarChart } from "@/components/admin/stats/AgeRangeBarChart";
import { BusinessTypePieChart } from "@/components/admin/stats/BusinessTypePieChart";
import { ProductsByYearBarChart } from "@/components/admin/stats/ProductsByYearBarChart";
import { ProductsByMonthPieChart } from "@/components/admin/stats/ProductsByMonthPieChart";
import { TopUsersTable } from "@/components/admin/stats/TopUsersTable";
import type {
  UsersByAgeRangeRow,
  AffiliatedByTypeRow,
  ProductsRedeemedByYearRow,
  ProductsRedeemedByMonthRow,
  PointsSummaryRow,
} from "@/lib/api/statistics";

interface StatsContentProps {
  ageData: UsersByAgeRangeRow[];
  businessData: AffiliatedByTypeRow[];
  yearData: ProductsRedeemedByYearRow[];
  initialMonthData: ProductsRedeemedByMonthRow[];
  topUsersData: PointsSummaryRow[];
  initialYear: number;
}

export default function StatsContent({
  ageData,
  businessData,
  yearData,
  initialMonthData,
  topUsersData,
  initialYear,
}: StatsContentProps) {
  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [monthData, setMonthData] = useState<ProductsRedeemedByMonthRow[]>(initialMonthData);
  const [isPending, startTransition] = useTransition();

  const handleYearChange = async (year: number) => {
    setSelectedYear(year);
    startTransition(async () => {
      try {
        const response = await fetch(`/api/statistics/products-by-month?year=${year}`);
        const result = await response.json();
        if (result.data) {
          setMonthData(result.data);
        }
      } catch (error) {
        console.error("Error fetching month data:", error);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Row 1: Age ranges and Business types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatCard title="Usuarios por Rango de Edad">
          <AgeRangeBarChart data={ageData} />
        </StatCard>
        <StatCard title="Tipos de Comercios">
          <BusinessTypePieChart data={businessData} />
        </StatCard>
      </div>

      {/* Row 2: Products by year and by month */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatCard title="Productos Canjeados por Año">
          <ProductsByYearBarChart data={yearData} />
        </StatCard>
        <StatCard title="Total de compras por mes">
          <div className="mb-4">
            <label htmlFor="year-select" className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar año:
            </label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) => handleYearChange(Number(e.target.value))}
              disabled={isPending}
              className="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-3 py-2 border disabled:opacity-50"
            >
              {yearData.map((item) => (
                <option key={item.year} value={item.year || 0}>
                  {item.year}
                </option>
              ))}
            </select>
          </div>
          {isPending ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : (
            <ProductsByMonthPieChart data={monthData} selectedYear={selectedYear} />
          )}
        </StatCard>
      </div>

      {/* Row 3: Top 5 users */}
      <StatCard title="Top 5 Usuarios con mejores puntajes">
        <TopUsersTable data={topUsersData} limit={5} />
      </StatCard>
    </div>
  );
}
