"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthProvider";
import { ADMIN_ROUTES } from "@/config/routes";

// Navbar exclusivo para el área de administración
// Inspirado en el navbar público pero con las secciones mostradas en el mock
export default function AdminNavbar() {
	const router = useRouter();
	const pathname = usePathname();
	const { signOut } = useAuth();

	const items: Array<{ label: string; href: string; isPill?: boolean }> = [
		{ label: "Auditoría", href: "/admin/auditoria", isPill: true },
		{ label: "Configuraciones", href: ADMIN_ROUTES.SETTINGS },
		{ label: "Solicitudes", href: "#" },
		{ label: "Consultas", href: "#" },
		{ label: "Estadísticas", href: ADMIN_ROUTES.REPORTS },
	];

	const handleBack = () => router.back();

	const handleSignOut = async () => {
		await signOut();
		router.push("/login");
	};

	return (
		<nav className="w-full border-b bg-white">
			<div className="mx-auto flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
				{/* Branding + back */}
				<div className="flex items-center gap-3">
					<Link href={ADMIN_ROUTES.OVERVIEW} className="flex items-center gap-2">
						<Image src="/logo.png" alt="EcoColones" width={28} height={28} className="rounded-full" />
						<span className="font-semibold text-base sm:text-lg">EcoColones</span>
					</Link>
					<button
						onClick={handleBack}
						className="ml-1 inline-flex items-center justify-center rounded p-1 hover:bg-muted/60"
						aria-label="Volver"
						title="Volver"
					>
						<ArrowLeft className="size-5" />
					</button>
				</div>

				{/* Nav items */}
				<div className="hidden md:flex items-center gap-6">
					{items.map((it) => {
						const active = pathname === it.href;
						const base = "text-sm transition-colors";
						if (it.isPill) {
							return (
								<Link
									key={it.label}
									href={it.href}
									className={`rounded-full px-3 py-1 text-sm ${active ? "bg-muted text-foreground" : "bg-muted text-foreground/80"}`}
								>
									{it.label}
								</Link>
							);
						}
						return (
							<Link
								key={it.label}
								href={it.href}
								className={`${base} ${active ? "text-foreground" : "text-foreground/80 hover:text-foreground"}`}
							>
								{it.label}
							</Link>
						);
					})}
				</div>

				{/* Logout */}
				<div className="flex items-center">
					<Button onClick={handleSignOut} className="bg-red-400 hover:bg-red-500 text-black font-medium rounded-full px-4 py-1 h-8">
						<span className="mr-2">Cerrar Sesión</span>
						<LogOut className="size-4" />
					</Button>
				</div>
			</div>

			{/* Items en móvil */}
			<div className="md:hidden border-t">
				<div className="px-4 py-2 flex flex-wrap gap-2 items-center">
					{items.map((it) => {
						const active = pathname === it.href;
						const classes = it.isPill
							? `rounded-full px-3 py-1 text-xs ${active ? "bg-muted text-foreground" : "bg-muted text-foreground/80"}`
							: `text-xs ${active ? "text-foreground" : "text-foreground/80"}`;
						return (
							<Link key={it.label} href={it.href} className={classes}>
								{it.label}
							</Link>
						);
					})}
				</div>
			</div>
		</nav>
	);
}

