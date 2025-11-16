import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

type Params = { id: string };

export type UpdateConfig = {
  table: string;
  idColumn: string;
  // Explicit whitelist of fields allowed to be updated.
  // If omitted, all fields are allowed except the id and audit fields.
  allowedFields?: string[];
  // Whether the table has an updated_by column.
  hasUpdatedBy?: boolean;
};

// Generic handler to update a single row by ID in a Supabase table
export async function updateById(
  request: Request,
  params: Params | Promise<Params>,
  { table, idColumn, allowedFields, hasUpdatedBy = true }: UpdateConfig
) {
  try {
    const supabase = await createClient();
    const body = await request.json().catch(() => ({}));

    // Basic guard: require ID
    const { id } = (await Promise.resolve(params)) || ({} as Params);
    if (!id) {
      return NextResponse.json(
        { error: "Parámetro 'id' es requerido en la ruta." },
        { status: 400 }
      );
    }

    // Get current user (optional for audit)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Build payload filtering out non-allowed fields
    const forbidden = new Set([
      idColumn,
      "created_by",
      "created_at",
      "updated_at",
      "binnacle_id",
      "user_id",
    ]);

    const filtered: Record<string, unknown> = {};
    if (allowedFields && Array.isArray(allowedFields)) {
      for (const key of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(body, key)) {
          filtered[key] = body[key];
        }
      }
    } else {
      for (const [key, value] of Object.entries(body)) {
        if (!forbidden.has(key)) {
          filtered[key] = value;
        }
      }
    }

    if (hasUpdatedBy && user?.id) {
      filtered["updated_by"] = user.id;
    }

    if (!Object.keys(filtered).length) {
      return NextResponse.json(
        { error: "No hay campos válidos para actualizar." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from(table)
      .update(filtered)
      .eq(idColumn, id)
      .select();

    if (error) {
      return NextResponse.json(
        { error: `Error al actualizar ${table}: ${error.message}` },
        { status: 400 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: `No se encontró el recurso con id ${id}` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Actualización realizada correctamente",
        data,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json(
        { error: `Error interno: ${err.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Helpers to quickly generate a PATCH handler per table
export function buildPatchHandler(config: UpdateConfig) {
  return async function PATCH(
    request: Request,
    context: { params: Params | Promise<Params> }
  ) {
    // Next.js 15 pasa params como Promesa; soportamos ambos casos
    return updateById(request, context.params, config);
  };
}
