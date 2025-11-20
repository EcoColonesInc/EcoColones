"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toast, useToast } from "@/components/ui/toast";
import {useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client"
import Image from "next/image";
import Link from "next/link";
import { AUTH_ROUTES, ADMIN_ROUTES, USER_ROUTES, AFFILIATE_ROUTES, CENTER_ROUTES } from "@/config/routes";
import { Role } from "@/types/role";

export default function LoginPage() {
  const { toast, showToast, hideToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin() {
    if (!email || !password) {
      showToast("Por favor, ingresa tu correo y contraseña.", "error");
      return;
    }
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      showToast("Por favor, verifica tus credenciales e intenta nuevamente.", "error");
      return;
    }

    showToast("¡Inicio de sesión exitoso!", "success");

    // Intentar obtener rol para redirigir inmediatamente sin pasar por /authorized
    try {
      const userId = data.user?.id;
      if (userId) {
        const { data: roleData, error: roleErr } = await supabase.rpc("get_user_role", { p_user_id: userId });
        const role = (roleData as Role) ?? null;
        if (roleErr) throw roleErr;
        
        // Refresh the page before redirecting
        router.refresh();
        
        switch (role) {
          case Role.ADMIN:
            router.push(ADMIN_ROUTES.OVERVIEW);
            return;
          case Role.USER:
            router.push(USER_ROUTES.OVERVIEW);
            return;
          case Role.AFFILIATE:
            router.push(AFFILIATE_ROUTES.OVERVIEW);
            return;
          case Role.CENTER:
            router.push(CENTER_ROUTES.OVERVIEW);
            return;
          default:
            router.push(AUTH_ROUTES.REGISTER);
            return;
        }
      }
      // Si no hay userId todavía, usar flujo estándar
      router.refresh();
      router.push(AUTH_ROUTES.AUTHORIZED);
    } catch {
      // Fallback seguro a /authorized para que middleware decida
      router.refresh();
      router.push(AUTH_ROUTES.AUTHORIZED);
    }
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 xl:gap-30 w-full max-w-6xl">
          <div className="w-full max-w-md">
            <h1 className="mb-8 sm:mb-12 lg:mb-20 text-3xl sm:text-4xl lg:text-5xl font-bold text-center lg:text-left">Iniciar Sesión</h1>
            <div className="w-full">
              
              {/* Email Field */}
              <Label className="mb-1 block">Correo</Label>
              <Input
                type="email"
                placeholder="Ingrese su correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mb-4"
              />

              {/* Password Field */}
              <Label className="mb-1 block">Contraseña</Label>
              <Input
                type="password"
                placeholder="Ingrese su contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mb-4"
              />

              {/* Login Button and Signup Link */}
              <Button variant="default" size="sm" onClick={handleLogin} className="w-full sm:w-auto">
                Iniciar Sesión
              </Button>
              <div className="mt-4 text-center sm:text-left">
                <p className="text-sm text-muted-foreground">
                  ¿No estás registrado?{" "}
                  <Link href={AUTH_ROUTES.SIGNUP}>
                    <Button variant="link" size="sm" className="p-0 h-auto">
                      Regístrate aquí
                    </Button>
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <Image src="/logo.png" alt="EcoColones Logo" width={400} height={400} className="w-64 h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96" />
          </div>
        </div>
      </div>


      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={hideToast}
          position="top"
        />
      )}
    </>
  );
}