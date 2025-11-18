import { NextResponse } from "next/server";
import { getUsersWithMostRecycled } from '@/lib/api/users';

// GET - Obtained all users_with_most_recycled with its info
export async function GET() {
  const { data, error } = await getUsersWithMostRecycled();

  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  return NextResponse.json(data);
}
