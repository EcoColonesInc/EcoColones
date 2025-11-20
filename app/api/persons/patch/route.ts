import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// PATCH - Update current user's person data
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    
    // Allowed fields for update
    const allowedFields = [
      "first_name",
      "last_name",
      "second_last_name",
      "telephone_number",
      "gender",
    ];

    // Filter only allowed fields
    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Update person record
    const { data, error } = await supabase
      .from("person")
      .update(updateData)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating person:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/persons error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
