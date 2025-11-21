import { NextResponse } from 'next/server';
import { getCollectionCenterById, getTopRecyclersByCenter, getUserCollectionCenter } from '@/lib/api/collectioncenters';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const resolvedParams = await context.params;
  const id = resolvedParams?.id;
  
  if (!id) {
    return NextResponse.json({ error: 'Missing collection center id' }, { status: 400 });
  }

  // Special case: if id is 'user', return authenticated user's collection center
  if (id === 'user') {
    const { data, error } = await getUserCollectionCenter();
    
    if (error) {
      return NextResponse.json({ error }, { status: error === 'Unauthorized' ? 401 : 404 });
    }
    
    if (!data) {
      return NextResponse.json({ error: 'Collection center not found' }, { status: 404 });
    }
    
    return NextResponse.json(data);
  }

  // Check if query parameter requests top recyclers
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (query === 'top_recyclers') {
    const { data, error } = await getTopRecyclersByCenter(id);
    
    if (error) {
      return NextResponse.json({ error }, { status: 404 });
    }
    
    return NextResponse.json(data);
  }

  // Default: return collection center details
  const { data, error } = await getCollectionCenterById(id);

  if (error) {
    return NextResponse.json({ error }, { status: 404 });
  }

  return NextResponse.json(data);
}