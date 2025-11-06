"use client";

import Image from "next/image";

export default function AdminDashboard() {
  const adminName = "David Morales"; // change this to fetch actual admin name

  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-screen px-6 md:px-16 bg-white text-center md:text-left">
      {/* Left: Logo */}
      <div className="flex justify-center md:justify-end md:w-1/2 mb-10 md:mb-0">
        <Image
          src="/logo.png"
          alt="EcoColones Logo"
          width={350}
          height={350}
          className="rounded-full"
        />
      </div>

      {/* Right: Text */}
      <div className="md:w-1/2 space-y-4">
        <h1 className="text-2xl md:text-3xl font-semibold">
          Bienvenid@ al panel de administrador{" "}
          <span className="text-primary font-bold">{adminName}</span>
        </h1>
        <p className="text-gray-600">
          Usa la barra de navegación superior para continuar.
        </p>
      </div>
    </div>
  );
}
