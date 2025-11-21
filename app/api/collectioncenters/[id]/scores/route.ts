import { NextResponse } from 'next/server';
import { getCollectionCenterUserScores } from '@/lib/api/collectioncenters';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const resolvedParams = await context.params;
  const id = resolvedParams?.id;
  
  if (!id) {
    return NextResponse.json({ error: 'Missing collection center id' }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const userName = searchParams.get('user_name')?.trim() || undefined;
  const identification = searchParams.get('identification')?.trim() || undefined;

  const { data, error } = await getCollectionCenterUserScores(id, userName, identification);

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(data);
}
