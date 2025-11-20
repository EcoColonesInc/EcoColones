import { NextResponse } from 'next/server';
import { getUserCollectionCenter } from '@/lib/api/collectioncenters';
import { getTransactionsByCollectionCenterId } from '@/lib/api/transactions';

export async function GET() {
  // Obtener el collection center del usuario
  const { data: centerData, error: centerError } = await getUserCollectionCenter();

  if (centerError || !centerData) {
    return NextResponse.json({ error: centerError || 'Collection center not found' }, { status: 404 });
  }

  // Obtener las transacciones del collection center
  const { data: transactionsData, error: transactionsError } = await getTransactionsByCollectionCenterId(
    centerData.collectioncenter_id
  );

  if (transactionsError) {
    return NextResponse.json({ error: transactionsError }, { status: 404 });
  }

  // Retornar ambos datos: el collection center y sus transacciones
  return NextResponse.json({
    collectionCenter: centerData,
    transactions: transactionsData
  });
}