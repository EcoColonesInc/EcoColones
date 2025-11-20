import { createClient } from '@/utils/supabase/server';

// Resultado de la función `get_points_summary` en la DB
export type PointsSummaryRow = {
  first_name: string | null;
  last_name: string | null;
  acumulated_points: number | string | null;
  spent_points: number | string | null;
  difference: number | string | null;
  total_points: number | string | null;
};

// Stats: users by age ranges
export type UsersByAgeRangeRow = {
  age_range: string | null;
  user_count: number | string | null;
};

// Stats: affiliated businesses by type
export type AffiliatedByTypeRow = {
  business_type: string | null;
  total: number | string | null;
};

// Stats: products redeemed by month
export type ProductsRedeemedByMonthRow = {
  year: number | null;
  month: number | null;
  month_name: string | null;
  total_products: number | string | null;
};

// Stats: products redeemed by year
export type ProductsRedeemedByYearRow = {
  year: number | null;
  total_products: number | string | null;
};

/*
 * Llama al RPC `get_points_summary(p_start_date, p_end_date)` y devuelve el resultado.
 * Acepta fechas `Date` o cadenas; las `Date` se serializan a ISO.
 */

export async function getPointsSummary(
  startDate?: Date | string | null,
  endDate?: Date | string | null
) {
  const supabase = await createClient();

  const rpcParams = {
    p_start_date: startDate
      ? startDate instanceof Date
        ? startDate.toISOString()
        : startDate
      : null,
    p_end_date: endDate ? (endDate instanceof Date ? endDate.toISOString() : endDate) : null,
  };

  const { data, error } = await supabase.rpc('get_points_summary', rpcParams);

  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data: data as PointsSummaryRow[] };
}

/*
 * Llama al RPC `stats_users_by_age_ranges(p_ref_date)` y devuelve el resultado.
 * Acepta fecha `Date` o cadena; la `Date` se serializa a ISO.
 */

export async function statsUsersByAgeRanges(
  refDate?: Date | string | null
) {
  const supabase = await createClient();

  const rpcParams: Record<string, unknown> = {};
  if (refDate !== undefined) {
    rpcParams.p_ref_date = refDate instanceof Date ? refDate.toISOString().slice(0, 10) : refDate;
  }

  const { data, error } = await supabase.rpc('stats_users_by_age_ranges', rpcParams);

  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data: data as UsersByAgeRangeRow[] };
}

/*
 * Llama al RPC `stats_affiliated_by_type()` y devuelve el resultado.
 */

export async function statsAffiliatedByType() {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('stats_affiliated_by_type');

  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data: data as AffiliatedByTypeRow[] };
}

/*
 * Llama al RPC `stats_products_redeemed_by_month(p_year)` y devuelve el resultado.
 */

export async function statsProductsRedeemedByMonth(year?: number | null) {
  const supabase = await createClient();

  // Validate year when provided: must be a positive integer
  if (year !== undefined && year !== null) {
    if (!Number.isInteger(year) || year <= 0) {
      return { error: 'Invalid `year` parameter. Provide a positive integer.', data: null };
    }
  }

  const rpcParams: Record<string, unknown> = {};
  if (year !== undefined && year !== null) rpcParams.p_year = year;

  const { data, error } = await supabase.rpc('stats_products_redeemed_by_month', rpcParams);

  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data: data as ProductsRedeemedByMonthRow[] };
}

/*
 * Llama al RPC `stats_products_redeemed_by_year()` y devuelve el resultado.
 */

export async function statsProductsRedeemedByYear() {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('stats_products_redeemed_by_year');

  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data: data as ProductsRedeemedByYearRow[] };
}


