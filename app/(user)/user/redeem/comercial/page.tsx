"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Product {
  name: string;
  description: string;
  price: number;
  image: string;
}

export default function StorePage() {
  // Example products — can be loaded from Supabase
  const products: Product[] = [
    {
      name: "Big Mac",
      description:
        "Delicioso emparedado con 100% carne 100% real, lechuga, pepinillos y cebolla...",
      price: 1200,
      image: "/productos/bigmac.png",
    },
    {
      name: "Sundae",
      description:
        "Helado de vainilla, bañado en chocolate o fresa según selección...",
      price: 900,
      image: "/productos/sundae.png",
    },
    {
      name: "Papas Medianas",
      description:
        "Corte clásico, crujientes papas fritas acompañadas de salsa de tomate...",
      price: 1000,
      image: "/productos/fries.png",
    },
  ];

  // Cart state
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [showModal, setShowModal] = useState(false);

  const total = Object.entries(cart).reduce((acc, [name, qty]) => {
    const product = products.find((p) => p.name === name);
    return acc + (product?.price ?? 0) * qty;
  }, 0);

  const updateQty = (name: string, qty: number) => {
    setCart((prev) => ({
      ...prev,
      [name]: Math.max(0, qty),
    }));
  };

  const accumulatedPoints = 12700; // example value

  return (
    <div className="min-h-screen bg-white px-6 md:px-16 py-10 flex gap-12">
      {/* LEFT SIDE CONTENT */}
      <div className="flex-1">
        {/* Store Header */}
        <button
          onClick={() => history.back()}
          className="text-2xl mb-2 cursor-pointer"
        >
          ←
        </button>
        <h1 className="text-4xl font-bold">McDonalds</h1>
        <p className="text-gray-600 mb-10">
          San Pablo, Heredia, Heredia, Costa Rica
        </p>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {products.map((p) => (
            <div
              key={p.name}
              className="border border-gray-200 rounded-xl p-5 shadow-sm"
            >
              <Image
                src={p.image}
                alt={p.name}
                width={130}
                height={130}
                className="mx-auto mb-3"
              />
              <h3 className="font-semibold text-lg">{p.name}</h3>
              <p className="text-sm text-gray-700 mb-4">{p.description}</p>

              {/* Quantity Selector */}
              <div className="flex items-center gap-3 mb-4">
                <button
                  className="bg-gray-200 px-3 py-1 rounded-md"
                  onClick={() => updateQty(p.name, (cart[p.name] ?? 0) - 1)}
                >
                  –
                </button>
                <span className="w-8 text-center font-semibold">
                  {cart[p.name] ?? 0}
                </span>
                <button
                  className="bg-gray-200 px-3 py-1 rounded-md"
                  onClick={() => updateQty(p.name, (cart[p.name] ?? 0) + 1)}
                >
                  +
                </button>
              </div>

              {/* Add Button */}
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={() => updateQty(p.name, (cart[p.name] ?? 0) + 1)}
              >
                {p.price} puntos — Agregar
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <div className="w-[320px] space-y-6">
        {/* CART */}
        <div className="bg-[#F7FCFA] border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-lg mb-3">Carrito de compra</h3>

          <table className="w-full text-sm mb-4">
            <thead className="text-left text-gray-600">
              <tr>
                <th>Producto</th>
                <th>Cant.</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(cart)
                .filter(([_, qty]) => qty > 0)
                .map(([name, qty]) => {
                  const product = products.find((p) => p.name === name);
                  return (
                    <tr key={name}>
                      <td>{name}</td>
                      <td>{qty}</td>
                      <td>{(product?.price ?? 0) * qty}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>

          <p className="font-semibold mb-4">
            Monto Total: {total} puntos
          </p>

          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={() => setShowModal(true)}
          >
            Comprar
          </Button>
        </div>

        {/* ACCUMULATED POINTS */}
        <div className="bg-[#F7FCFA] border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold mb-2">Puntos acumulados</h3>
          <p className="text-xl font-bold">{accumulatedPoints} puntos</p>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-lg w-[400px]">
            <h3 className="text-blue-600 font-semibold mb-3">
              confirmacion compra
            </h3>

            <p className="mb-6 text-gray-700">
              Estás realizando una compra <br />
              Seguro que deseas utilizar{" "}
              <strong>{total} puntos</strong> por la compra en el comercio de
              <strong> McDonalds</strong>? <br />
              Una vez confirmado, se te enviará un correo de la transacción
              realizada, el cual deberás presentar en el comercio.
            </p>

            <div className="flex justify-end gap-3">
              <Button
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => alert("Compra confirmada")}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
