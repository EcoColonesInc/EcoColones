"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthProvider";
import { ADMIN_ROUTES } from "@/config/routes";
import { useState } from "react";

// Navbar exclusivo para el área de administración
// Inspirado en el navbar público pero con las secciones mostradas en el mock
export default function AdminNavbar() {
	const router = useRouter();
	const pathname = usePathname();
	const { signOut } = useAuth();

	const items: Array<{ label: string; href: string; isPill?: boolean; hasMenu?: boolean }> = [
		{ label: "Auditoría", href: ADMIN_ROUTES.AUDIT, isPill: true },
		{ label: "Configuraciones", href: ADMIN_ROUTES.SETTINGS, hasMenu: true },
		{ label: "Solicitudes", href: ADMIN_ROUTES.APPROVALS, hasMenu: true },
		{ label: "Consultas", href: ADMIN_ROUTES.CONSULTAS, hasMenu: true },
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
						const active = pathname.startsWith(it.href);
						const base = "text-sm transition-colors";

						// Pill style item
						if (it.isPill) {
							return (
								<Link
									key={it.label}
									href={it.href}
									className={`${
										active
											? "rounded-full px-3 py-1 bg-muted text-foreground hover:text-white hover:bg-[#12D452]"
											: `${base} text-foreground/80 hover:text-white hover:bg-[#12D452] rounded-full px-3 py-1`
									}`}
								>
									{it.label}
								</Link>
							);
						}

						// Item with dropdown menu (hover)
						if (it.hasMenu) {
							if (it.href === ADMIN_ROUTES.CONSULTAS) {
								return <ConsultasMenu key={it.label} active={active} base={base} />;
							}
							if (it.href === ADMIN_ROUTES.SETTINGS) {
								return <SettingsMenu key={it.label} active={active} base={base} />;
							}
							if (it.href === ADMIN_ROUTES.APPROVALS) {
								return <ApprovalsMenu key={it.label} active={active} base={base} />;
							}
						}

						// Default link item
						return (
							<Link
								key={it.label}
								href={it.href}
								className={`${
									active
										? "rounded-full px-3 py-1 bg-muted text-foreground hover:text-white hover:bg-[#12D452]"
										: `${base} text-foreground/80 hover:text-white hover:bg-[#12D452] rounded-full px-3 py-1`
								}`}
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
						const active = pathname.startsWith(it.href);
						const classes = it.isPill
							? `${active ? "rounded-full px-3 py-1 bg-muted text-foreground" : "text-xs text-foreground/80"}`
							: `${active ? "rounded-full px-3 py-1 bg-muted text-foreground" : "text-xs text-foreground/80"}`;
						// For mobile, we won't render a hover dropdown; list parent only
						// Optionally, we could add the submenu inline later if needed
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

// Settings dropdown (Materiales, Monedas)
function SettingsMenu({ active, base }: { active: boolean; base: string }) {
	const [open, setOpen] = useState(false);

	return (
		<div
			className="relative"
			onMouseLeave={() => setOpen(false)}
		>
			<button
				type="button"
				className={`${
					active
						? "rounded-full px-3 py-1 bg-muted text-foreground hover:text-white hover:bg-[#12D452]"
						: `${base} text-foreground/80 hover:text-white hover:bg-[#12D452] rounded-full px-3 py-1`
				} appearance-none cursor-pointer`}
				onMouseEnter={() => setOpen(true)}
				aria-haspopup="menu"
				aria-expanded={open}
			>
				Configuraciones
			</button>
			{open && (
				<div className="absolute left-0 top-full z-50 mt-0 pt-2 min-w-56">
					<div className="rounded-md border bg-white p-2 shadow-md">
						<div
							className="flex flex-col gap-1"
							onMouseEnter={() => setOpen(true)}
						>
							<Link
								href={`/admin/settings/materiales`}
								className={"rounded px-3 py-2 text-sm hover:bg-muted"}
							>
								Materiales
							</Link>
							<Link
								href={`/admin/settings/currencies`}
								className={"rounded px-3 py-2 text-sm hover:bg-muted"}
							>
								Monedas
							</Link>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

// Separate component to manage precise hover behavior for Consultas dropdown
function ConsultasMenu({ active, base }: { active: boolean; base: string }) {
	const [open, setOpen] = useState(false);

	return (
		<div
			className="relative"
			onMouseLeave={() => setOpen(false)}
		>
			<button
				type="button"
				className={`${
					active
						? "rounded-full px-3 py-1 bg-muted text-foreground hover:text-white hover:bg-[#12D452]"
						: `${base} text-foreground/80 hover:text-white hover:bg-[#12D452] rounded-full px-3 py-1`
				} appearance-none cursor-pointer`}
				onMouseEnter={() => setOpen(true)}
				aria-haspopup="menu"
				aria-expanded={open}
			>
				Consultas
			</button>
			{/* Dropdown: appears only after hovering the button; hovering the box alone won't open it */}
			{open && (
				<div className="absolute left-0 top-full z-50 mt-0 pt-2 min-w-56">
					<div className="rounded-md border bg-white p-2 shadow-md">
						<div
							className="flex flex-col gap-1"
							onMouseEnter={() => setOpen(true)}
						>
							<Link
								href={ADMIN_ROUTES.CONSULTAS_USERS}
								className={"rounded px-3 py-2 text-sm hover:bg-muted"}
							>
								Usuarios
							</Link>
							<Link
								href={ADMIN_ROUTES.CONSULTAS_CENTERS}
								className={"rounded px-3 py-2 text-sm hover:bg-muted"}
							>
								Centro de Acopio
							</Link>
							<Link
								href={ADMIN_ROUTES.CONSULTAS_BUSINESSES}
								className={"rounded px-3 py-2 text-sm hover:bg-muted"}
							>
								Comercios
							</Link>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

// Separate component to manage precise hover behavior for Approvals dropdown
function ApprovalsMenu({ active, base }: { active: boolean; base: string }) {
	const [open, setOpen] = useState(false);

	return (
		<div
			className="relative"
			onMouseLeave={() => setOpen(false)}
		>
			<button
				type="button"
				className={`${
					active
						? "rounded-full px-3 py-1 bg-muted text-foreground hover:text-white hover:bg-[#12D452]"
						: `${base} text-foreground/80 hover:text-white hover:bg-[#12D452] rounded-full px-3 py-1`
				} appearance-none cursor-pointer`}
				onMouseEnter={() => setOpen(true)}
				aria-haspopup="menu"
				aria-expanded={open}
			>
				Solicitudes
			</button>
			{open && (
				<div className="absolute left-0 top-full z-50 mt-0 pt-2 min-w-56">
					<div className="rounded-md border bg-white p-2 shadow-md">
						<div
							className="flex flex-col gap-1"
							onMouseEnter={() => setOpen(true)}
						>
							<Link
								href={`/admin/approvals/centers`}
								className={"rounded px-3 py-2 text-sm hover:bg-muted"}
							>
								Centros de Acopio
							</Link>
							<Link
								href={`/admin/approvals/affiliates`}
								className={"rounded px-3 py-2 text-sm hover:bg-muted"}
							>
								Comercios Afiliados
							</Link>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}