import { NextResponse } from 'next/server';
import { getAllUsersPoints } from '@/lib/api/users';

export async function GET(request: Request) {
  const { data, error } = await getAllUsersPoints();

  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  return NextResponse.json(data);
}