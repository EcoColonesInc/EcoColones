"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthProvider";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { Role } from "@/types/role";

import { LANDING_PAGE_ROUTES, AUTH_ROUTES, USER_ROUTES, AFFILIATE_ROUTES } from "@/config/routes";

export function Navbar() {
  const { user, signOut, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push(AUTH_ROUTES.LOGIN);
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  }

  const closeMenu = () => {
    setIsMenuOpen(false);
  }

  // No mostrar la navbar genérica en el área de administración
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  // Verificar si estamos en el área de centro de acopio
  const isCenterArea = pathname?.startsWith("/center");

  return (
    <nav style={{ backgroundColor: '#F7FCFA' }} className="border-b backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href={LANDING_PAGE_ROUTES.HOME} className="flex items-center space-x-2">
          <Image src="/logo.png" alt="EcoColones Logo" width={40} height={40} />
          <div className="font-bold text-xl text-primary">EcoColones</div>
        </Link>

        
        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center space-x-6">
          {!user && !isCenterArea && (
            <>
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
            </>
          )}

          {role === Role.ADMIN && (
            <Link
              href="/admin/dashboard"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Panel de Control
            </Link>
          )}

          {role === Role.USER && (
            <>
            <Link
              href={USER_ROUTES.MIECOQR}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Mi EcoQR
            </Link>
            <Link
              href={USER_ROUTES.OVERVIEW}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Inicio
            </Link>

            <Link
              href={USER_ROUTES.CENTERS}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Centros de Acopio
            </Link>

            <Link
              href={USER_ROUTES.REDEEM}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Canjear
            </Link>

            <Link
              href={USER_ROUTES.PROFILE}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Perfil
            </Link>

            </>
          )}

          {role === Role.AFFILIATE && (
            <>
            <Link
              href={AFFILIATE_ROUTES.OVERVIEW}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Panel de Control
            </Link>

            <Link
              href={AFFILIATE_ROUTES.PRODUCTS}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Productos
            </Link>

            <Link
              href={AFFILIATE_ROUTES.TRANSACTIONS}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Transacciones
            </Link>

          </>
          )}

          {/* Center Navigation */}
          {isCenterArea && (
            <>
              <Link
                href="/center/dashboard"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  pathname === "/center/dashboard"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Panel
              </Link>
              <Link
                href="/center/queries"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  pathname === "/center/queries"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Consultas
              </Link>
            </>
          )}

          {/* Auth Buttons */}
          {user || isCenterArea ? (
            <Button variant="close" size="sm" onClick={handleSignOut}>Cerrar Sesión</Button>
          ) : (
            <Link href={AUTH_ROUTES.LOGIN}>
              <Button variant="default" size="sm">Ingresar</Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="lg:hidden p-2 text-foreground hover:text-foreground/80 transition-colors"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t" style={{ backgroundColor: '#F7FCFA' }}>
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            {!user && !isCenterArea && (
              <>
                <Link
                  href={LANDING_PAGE_ROUTES.HOME}
                  className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                  onClick={closeMenu}
                >
                  Inicio
                </Link>
                <Link
                  href={LANDING_PAGE_ROUTES.AFFILIATES}
                  className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                  onClick={closeMenu}
                >
                  Comercios Afiliados
                </Link>
                <Link
                  href={LANDING_PAGE_ROUTES.CENTERS}
                  className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                  onClick={closeMenu}
                >
                  Centros de Acopio
                </Link>
                <Link
                  href={LANDING_PAGE_ROUTES.ABOUT}
                  className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                  onClick={closeMenu}
                >
                  ¿Cómo Funciona?
                </Link>
              </>
            )}

            {/* Center Navigation Mobile */}
            {isCenterArea && (
              <>
                <Link
                  href="/center/dashboard"
                  className={`px-4 py-2 rounded-full text-sm font-medium text-center ${
                    pathname === "/center/dashboard"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={closeMenu}
                >
                  Panel
                </Link>
                <Link
                  href="/center/queries"
                  className={`px-4 py-2 rounded-full text-sm font-medium text-center ${
                    pathname === "/center/queries"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={closeMenu}
                >
                  Consultas
                </Link>
              </>
            )}

            {/* Mobile Auth Buttons */}
            {user || isCenterArea ? (
              <Button variant="default" size="sm" onClick={() => { handleSignOut(); closeMenu(); }} className="w-full">
                Cerrar Sesión
              </Button>
            ) : (
              <Link href={AUTH_ROUTES.LOGIN} onClick={closeMenu}>
                <Button variant="default" size="sm" className="w-full">Ingresar</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
