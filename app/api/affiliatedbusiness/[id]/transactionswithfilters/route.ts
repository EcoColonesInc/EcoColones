import { NextResponse } from 'next/server';
import {
  getTransactionsByAffiliatedBusinessIdWithFilters,
  AffiliatedTransactionsFilters,
} from '@/lib/api/transactions';

export async function GET(
  request: Request,
  context: { params?: Promise<{ id?: string }> }
) {
  const resolvedParams = context?.params ? await context.params : undefined;
  const affiliatedBusinessId = resolvedParams?.id;

  if (!affiliatedBusinessId) {
    return NextResponse.json({ error: 'Missing affiliated business id' }, { status: 400 });
  }

  const url = new URL(request.url);
  const q = url.searchParams;

  const userName = q.get('userName') ?? undefined;
  // prefer `date` but accept `startDate` for compatibility
  const date = q.get('date') ?? q.get('startDate') ?? undefined; // 'YYYY-MM-DD'
  const productName = q.get('productName') ?? undefined;
  const totalPriceParam = q.get('totalPrice');

  let totalPrice: number | undefined = undefined;
  if (totalPriceParam !== null) {
    const parsed = Number(totalPriceParam);
    if (Number.isNaN(parsed)) {
      return NextResponse.json({ error: 'Invalid totalPrice parameter' }, { status: 400 });
    }
    totalPrice = parsed;
  }

  const filters: AffiliatedTransactionsFilters = {};
  if (userName) filters.userName = userName;
  if (date) filters.date = date;
  if (productName) filters.productName = productName;
  if (typeof totalPrice !== 'undefined') filters.totalPrice = totalPrice;

  const { data, error } = await getTransactionsByAffiliatedBusinessIdWithFilters(
    affiliatedBusinessId,
    Object.keys(filters).length ? filters : undefined
  );

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(data);
}