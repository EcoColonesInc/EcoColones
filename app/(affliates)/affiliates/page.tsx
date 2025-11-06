"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface Product {
  name: string;
  image: string;
  price: number;
}

export default function ComerciosAfiliadosLanding() {
  // Sample products (could later come from Supabase)
  const products: Product[] = [
    { name: "McDonald's Big Mac", image: "/products/bigmac.png", price: 1200 },
    { name: "McDonald's Papas Fritas", image: "/products/fries.png", price: 1000 },
    { name: "Taco Bell Chalupa", image: "/products/chalupa.png", price: 300 },
    { name: "Taco Bell Wrap", image: "/products/wrap.png", price: 500 },
  ];

  const [index, setIndex] = useState(0);

  const next = () => setIndex((i) => (i + 1) % products.length);
  const prev = () => setIndex((i) => (i - 1 + products.length) % products.length);

  return (
    <div className="min-h-screen bg-white py-10 px-6 md:px-16">
      <div className="max-w-6xl mx-auto">
        {/* --- Title --- */}
        <h1 className="text-4xl font-bold mb-8 text-center md:text-left">
          Comercios Afiliados
        </h1>

        {/* --- Popular Products Section --- */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold mb-4">Productos populares</h2>
          <div className="relative flex items-center">
            {/* Left Arrow */}
            <button
              onClick={prev}
              className="absolute left-0 z-10 p-2 bg-white rounded-full shadow hover:bg-gray-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Products Carousel */}
            <div className="flex overflow-x-auto space-x-4 px-10 scrollbar-hide snap-x">
              {products.map((p, i) => (
                <div
                  key={p.name}
                  className={`min-w-[200px] flex-shrink-0 bg-white border border-gray-200 rounded-lg shadow-sm snap-start transition-transform duration-300 ${
                    i === index ? "scale-100" : "scale-95 opacity-90"
                  }`}
                >
                  <Image
                    src={p.image}
                    alt={p.name}
                    width={200}
                    height={180}
                    className="rounded-t-lg object-cover w-full h-[140px]"
                  />
                  <div className="p-3 text-center">
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-gray-600 text-sm">{p.price} EC</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Arrow */}
            <button
              onClick={next}
              className="absolute right-0 z-10 p-2 bg-white rounded-full shadow hover:bg-gray-100"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* --- Why Register Section --- */}
        <section className="mb-10 text-center md:text-left">
          <h2 className="text-xl font-semibold mb-2">¿Por qué registrarte?</h2>
          <p className="text-gray-700 max-w-3xl">
            Registra tu comercio en EcoColones y forma parte de una iniciativa que impulsa la
            sostenibilidad a través del reciclaje responsable. Al unirte, tu negocio gana
            visibilidad ante una comunidad comprometida con el ambiente, atrae nuevos clientes que
            valoran el consumo responsable y fortalece su imagen como un aliado del desarrollo
            sostenible.
          </p>
        </section>

        {/* --- Forms Section --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* --- New Registration Request --- */}
          <div className="bg-[#F7FCFA] border border-gray-200 rounded-xl p-8 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">¡Quiero unirme!</h3>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Correo</label>
                <input
                  type="email"
                  placeholder="Ingresa tu correo"
                  className="w-full bg-[#E6F2EA] rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">¿Por qué te quieres unir?</label>
                <textarea
                  placeholder="Cuéntanos brevemente..."
                  className="w-full bg-[#E6F2EA] rounded-md px-3 py-2 h-24 resize-none"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium rounded-md py-2"
              >
                Solicitar registro como comercio afiliado
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
