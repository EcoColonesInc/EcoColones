import { NextResponse } from 'next/server';
import { getAllAffiliatedBusinessesXProducts } from '@/lib/api/products';

export async function GET(request: Request) {
  const { data, error } = await getAllAffiliatedBusinessesXProducts();

  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  return NextResponse.json(data);
}