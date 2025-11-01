"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthProvider";
import { useRouter } from "next/navigation";

import { LANDING_PAGE_ROUTES } from "@/config/routes";

export function Navbar() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  }

  return (
    <nav style={{ backgroundColor: '#F7FCFA' }} className="border-b backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/logo.png" alt="EcoColones Logo" width={40} height={40} />
          <div className="font-bold text-xl text-primary">EcoColones</div>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6">
          <Link
            href={LANDING_PAGE_ROUTES.HOME}
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
          >
            Inicio
          </Link>
          <Link
            href={LANDING_PAGE_ROUTES.AFFILIATES}
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
          >
            Comercios Afiliados
          </Link>
          <Link
            href={LANDING_PAGE_ROUTES.CENTERS}
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
          >
            Centros de Acopio
          </Link>
          <Link
            href={LANDING_PAGE_ROUTES.ABOUT}
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
          >
            ¿Cómo Funciona?
          </Link>
          
          {/* Auth Buttons */}
          {user ? (
            <Button variant="default" size="sm" onClick={handleSignOut}>Cerrar Sesión</Button>
          ) : (
            <Link href="/login">
              <Button variant="default" size="sm">Ingresar</Button>
            </Link>
          )}
            
        </div>
      </div>
    </nav>
  );
}
