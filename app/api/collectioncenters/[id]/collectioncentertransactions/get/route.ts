import { NextResponse } from 'next/server';
import { getTransactionsByCollectionCenterId } from '@/lib/api/transactions';
import { getUserCollectionCenter } from '@/lib/api/collectioncenters';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const resolvedParams = await context.params;
  const id = resolvedParams?.id;
  
  // Si el id es 'me', obtener las transacciones del collection center del usuario autenticado
  if (id === 'me') {
    const { data: centerData, error: centerError } = await getUserCollectionCenter();
    if (centerError || !centerData) {
      return NextResponse.json({ error: centerError || 'Collection center not found' }, { status: centerError === 'Unauthorized' ? 401 : 404 });
    }
    const { data, error } = await getTransactionsByCollectionCenterId(centerData.collectioncenter_id);
    if (error) {
      return NextResponse.json({ error }, { status: 404 });
    }
    return NextResponse.json(data);
  }
  
  if (!id) {
    return NextResponse.json({ error: 'Missing collection center id' }, { status: 400 });
  }

  const { data, error } = await getTransactionsByCollectionCenterId(id);

  if (error) {
    return NextResponse.json({ error }, { status: 404 });
  }

  return NextResponse.json(data);
}