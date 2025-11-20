import { NextRequest, NextResponse } from "next/server";
import { statsProductsRedeemedByMonth } from "@/lib/api/statistics";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const yearParam = searchParams.get("year");
  const year = yearParam ? parseInt(yearParam, 10) : undefined;

  const result = await statsProductsRedeemedByMonth(year);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ data: result.data });
}
