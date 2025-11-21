import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month');
  const year = searchParams.get('year');

  const supabase = await createClient();
  
  const rpcParams: Record<string, string | number | null> = {
    p_collection_center_id: id,
    p_month: month ? parseInt(month) : null,
    p_year: year ? parseInt(year) : null
  };

  const { data, error } = await supabase.rpc('get_total_recycled_weight_by_center', rpcParams);

  if (error) {
    console.error('RPC Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ total: data || 0 });
}
