"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthProvider";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { LANDING_PAGE_ROUTES } from "@/config/routes";

export function Navbar() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  }

  const closeMenu = () => {
    setIsMenuOpen(false);
  }

  return (
    <nav style={{ backgroundColor: '#F7FCFA' }} className="border-b backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/logo.png" alt="EcoColones Logo" width={40} height={40} />
          <div className="font-bold text-xl text-primary">EcoColones</div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center space-x-6">
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
            
            {/* Mobile Auth Buttons */}
            {user ? (
              <Button variant="default" size="sm" onClick={() => { handleSignOut(); closeMenu(); }} className="w-full">
                Cerrar Sesión
              </Button>
            ) : (
              <Link href="/login" onClick={closeMenu}>
                <Button variant="default" size="sm" className="w-full">Ingresar</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
