import { NextResponse } from 'next/server';
import { getCollectionCenterById, getUserCollectionCenter } from '@/lib/api/collectioncenters';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const resolvedParams = await context.params;
  const id = resolvedParams?.id;
  
  // Si id == 'me', obtener collection center del usuario autenticado
  if (id === 'me') {
    const { data, error } = await getUserCollectionCenter();
    if (error) {
      return NextResponse.json({ error }, { status: error === 'Unauthorized' ? 401 : 404 });
    }
    return NextResponse.json(data);
  }
  
  if (!id) {
    return NextResponse.json({ error: 'Missing collection center id' }, { status: 400 });
  }

  const { data, error } = await getCollectionCenterById(id);

  if (error) {
    return NextResponse.json({ error }, { status: 404 });
  }

  return NextResponse.json(data);
}