"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { Role } from "@/types/role";
import { createClient } from "@/utils/supabase/client";
import { Facebook, Instagram, Twitter } from "lucide-react";

export default function AdminHomePage() {
  const { user, role } = useAuth();
  const [fullName, setFullName] = useState<string>("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        if (!user?.id) return;
        const supabase = createClient();
        const { data, error } = await supabase.rpc("get_profile_info", {
          p_user_id: user.id,
        });
        if (error) return; // En Home no mostramos errores de perfil
        // data puede ser objeto o array según RPC; tratamos ambos
        const info = Array.isArray(data)
          ? (data[0] as Record<string, unknown> | undefined)
          : (data as Record<string, unknown> | undefined);
        if (!active || !info) return;
        const fn = [
          (info as { first_name?: string }).first_name,
          (info as { last_name?: string }).last_name,
          (info as { second_last_name?: string }).second_last_name,
        ]
          .filter((v): v is string => Boolean(v))
          .join(" ")
          .trim();
        setFullName(fn || user.email || "Administrador/a");
      } catch {
        if (active) setFullName(user?.email || "Administrador/a");
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [user?.id, user?.email]);

  if (role && role !== Role.ADMIN) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">Acceso restringido</h2>
        <p>No cuentas con permisos para ver esta página.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-56px)] flex-col">
      {/* 56px ≈ altura navbar */}
      <section className="flex-1 grid grid-cols-1 lg:grid-cols-2 items-center gap-6 px-6 md:px-12 lg:px-16 py-10">
        {/* Logo grande */}
        <div className="flex justify-center lg:justify-start">
          <Image
            src="/logo.png"
            alt="EcoColones"
            width={420}
            height={420}
            className="w-[20rem] h-[20rem] sm:w-[22rem] sm:h-[22rem] lg:w-[26rem] lg:h-[26rem] rounded-full"
          />
        </div>
        {/* Texto de bienvenida */}
        <div className="text-center lg:text-left">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-snug">
            Bienvenid@ al panel de
            <br /> administrador {fullName}
          </h1>
          <p className="mt-6 text-muted-foreground text-base sm:text-lg">
            Usa la barra de navegación superior para continuar.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 lg:px-16 pb-6">
        <div className="flex items-center justify-between text-sm text-foreground/80">
          <Link href="#" className="hover:underline">
            Políticas y Privacidad
          </Link>
          <Link href="#" className="hover:underline">
            Términos de servicio
          </Link>
        </div>

        <div className="mt-10 flex flex-col items-center gap-2">
          <div className="flex items-center gap-4 text-foreground/80">
            <Link
              href="#"
              aria-label="Instagram"
              className="hover:text-foreground"
            >
              <Instagram className="h-4 w-4" />
            </Link>
            <Link
              href="#"
              aria-label="Twitter"
              className="hover:text-foreground"
            >
              <Twitter className="h-4 w-4" />
            </Link>
            <Link
              href="#"
              aria-label="Facebook"
              className="hover:text-foreground"
            >
              <Facebook className="h-4 w-4" />
            </Link>
          </div>
          <p className="text-xs text-foreground/70 mt-2">
            ©2025 EcoColones Inc. Todos los derechos reservados
          </p>
        </div>
      </footer>
    </div>
  );
}
