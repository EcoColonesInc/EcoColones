import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#F7FCFA] border-t">
      <div className="container mx-auto px-4 py-12">
        {/* Three Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1 - Company */}
          <div>
            <h3 className="font-bold text-lg mb-4">Compañía</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                  Acerca de Nosotros
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="https://www.linkedin.com/" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                  Carreras
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2 - Social Media */}
          <div>
            <h3 className="font-bold text-lg mb-4">Síguenos</h3>
            <div className="flex gap-4">
              <Link 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-foreground/80 hover:text-foreground transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="size-6" />
              </Link>
              <Link 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-foreground/80 hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="size-6" />
              </Link>
              <Link 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-foreground/80 hover:text-foreground transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="size-6" />
              </Link>
              <Link 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-foreground/80 hover:text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="size-6" />
              </Link>
            </div>
          </div>

          {/* Column 3 - Resources */}
          <div>
            <h3 className="font-bold text-lg mb-4">Recursos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-foreground/10">
          <p className="text-center text-sm text-foreground/60">
            © 2025 EcoColones Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
