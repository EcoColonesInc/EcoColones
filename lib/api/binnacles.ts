import { createClient } from '@/utils/supabase/server';

type BinnacleParams = {
  userName?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  startTime?: string; // 'HH:MM:SS' or 'HH:MM'
  endTime?: string;
  changeType?: string;
};

// Fetch information from the 'binnacle' function `get_binnacle`
export async function getBinnacle(params?: BinnacleParams) {
  const supabase = await createClient();

  const rpcParams = {
    p_user_name: params?.userName ?? null,
    p_start_date: params?.startDate
      ? params.startDate instanceof Date
        ? params.startDate.toISOString().slice(0, 10)
        : params.startDate
      : null,
    p_end_date: params?.endDate
      ? params.endDate instanceof Date
        ? params.endDate.toISOString().slice(0, 10)
        : params.endDate
      : null,
    p_start_time: params?.startTime ?? null,
    p_end_time: params?.endTime ?? null,
    p_change_type: params?.changeType ?? null,
  };

  const { data, error } = await supabase.rpc('get_binnacle', rpcParams);

  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data };
}
