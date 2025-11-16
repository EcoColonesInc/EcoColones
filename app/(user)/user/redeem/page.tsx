"use client";

import Image from "next/image";
import { Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function UserRedeemPage() {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([
    "fastfood",
  ]);

  const toggleFilter = (value: string) => {
    setSelectedFilters((prev) =>
      prev.includes(value) ? prev.filter((f) => f !== value) : [...prev, value]
    );
  };

  const stores = [
    {
      name: "McDonalds",
      location: "San Pablo, Heredia, Costa Rica",
      logo: "/comercios/mcdonalds.png",
      type: "fastfood",
    },
    {
      name: "Pops - Coronado",
      location: "San Antonio, Coronado, Costa Rica",
      logo: "/comercios/pops.png",
      type: "fastfood",
    },
    {
      name: "Taco Bell - Belén",
      location: "Belén, Heredia, Costa Rica",
      logo: "/comercios/tacobell.png",
      type: "fastfood",
    },
    {
      name: "La Estación - Cartago",
      location: "Cartago, Cartago, Costa Rica",
      logo: "/comercios/laestacion.png",
      type: "fastfood",
    },
    {
      name: "BurgerKing - Tibas",
      location: "Tibás, San José, Costa Rica",
      logo: "/comercios/burgerking.png",
      type: "fastfood",
    },
    {
      name: "Taco Bell - Oxígeno",
      location: "Heredia, Costa Rica",
      logo: "/comercios/tacobell.png",
      type: "fastfood",
    },
  ];

  const filteredStores = stores.filter((s) => selectedFilters.includes(s.type));

  return (
    <div className="min-h-screen bg-white px-6 md:px-16 py-10">
      <div className="max-w-7xl mx-auto flex gap-10">
        {/* LEFT SIDE - Search + Stores */}
        <div className="flex-1">
          {/* Search Bar */}
          <div className="relative mb-10">
            <input
              type="text"
              placeholder="Buscar comercio"
              className="w-full bg-[#F7FCFA] border border-gray-300 rounded-full px-5 py-3 focus:outline-none"
            />
            <Search
              className="absolute right-14 top-3.5 text-gray-500"
              size={22}
            />
            <SlidersHorizontal
              className="absolute right-5 top-3.5 text-gray-500"
              size={22}
            />
          </div>

          {/* Stores Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStores.map((store) => (
              <div
                key={store.name}
                className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 flex flex-col items-center"
              >
                <Image
                  src={store.logo}
                  alt={store.name}
                  width={110}
                  height={110}
                  className="mb-3"
                />
                <p className="font-semibold">{store.name}</p>
                <p className="text-sm text-gray-600 text-center">
                  {store.location}
                </p>

                <Link href={`/user/redeem/comercial`}>
                  <Button className="mt-3 bg-green-600 hover:bg-green-700 rounded-md w-full">
                    Ver comercio
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* PURCHASE HISTORY (center right panel) */}
        <div className="w-[300px] bg-[#F7FCFA] border border-gray-200 rounded-xl p-6 h-fit">
          <h3 className="font-semibold text-lg mb-4">Historial de compras</h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Big mac</span>
              <span>1400</span>
              <span>29/10/2025 5:30pm</span>
            </div>
            <div className="flex justify-between">
              <span>Cono Vainilla</span>
              <span>800</span>
              <span>28/10/2025 12:53pm</span>
            </div>
          </div>

          <Button className="mt-6 bg-green-600 hover:bg-green-700 rounded-md w-full">
            Ver más...
          </Button>
        </div>

        {/* FILTERS PANEL (right) */}
        <div className="w-[260px] bg-[#F7FCFA] border border-gray-200 rounded-xl p-6 h-fit">
          <h3 className="font-semibold mb-4">Filtro</h3>

          <p className="text-sm font-medium mb-3">
            Filtrar por tipo de comercio
          </p>

          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedFilters.includes("fastfood")}
                onChange={() => toggleFilter("fastfood")}
              />
              Comida rápida
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedFilters.includes("pharmacy")}
                onChange={() => toggleFilter("pharmacy")}
              />
              Farmacias
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedFilters.includes("fashion")}
                onChange={() => toggleFilter("fashion")}
              />
              Moda
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedFilters.includes("pets")}
                onChange={() => toggleFilter("pets")}
              />
              Mascotas
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
