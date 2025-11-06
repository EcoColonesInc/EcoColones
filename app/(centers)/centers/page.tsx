"use client";

import { Button } from "@/components/ui/button";

export default function CenterHome() {
  return (
    <div className="min-h-screen bg-white py-10 px-6 md:px-16">
      <div className="max-w-6xl mx-auto">
        {/* --- Title --- */}
        <h1 className="text-4xl font-bold mb-8 text-center md:text-left">
          Centros de acopio
        </h1>

        {/* --- Map Section --- */}
        <div className="w-full h-[400px] mb-10 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
          <iframe
            title="Mapa de centros de acopio"
            //src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3930.017647646895!2d-84.09072432503847!3d9.932621790188992!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8fa0e33fcb15f1df%3A0xfce348a04e3ad2e!2sUniversidad%20de%20Costa%20Rica!5e0!3m2!1ses!2scr!4v1700000000000!5m2!1ses!2scr"
            width="100%"
            height="100%"
            allowFullScreen
            loading="lazy"
            className="border-none"
          ></iframe>
        </div>

        {/* --- Why Register Section --- */}
        <section className="mb-10 text-center md:text-left">
          <h2 className="text-xl font-semibold mb-2">¿Por qué registrarte?</h2>
          <p className="text-gray-700 max-w-3xl">
            EcoColones conecta tu centro de acopio con una comunidad comprometida con el reciclaje,
            aumentando la recepción de materiales y mejorando tu visibilidad. Regístrate hoy para
            expandir tu alcance y contribuir a un futuro más verde y sostenible.
          </p>
        </section>

        {/* --- Forms Section --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* --- Existing Center Login --- */}
          <div className="bg-[#F7FCFA] border border-gray-200 rounded-xl p-8 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">¡Ya tengo una cuenta!</h3>

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
                <label className="block text-sm font-medium mb-1">Contraseña</label>
                <input
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  className="w-full bg-[#E6F2EA] rounded-md px-3 py-2"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium rounded-md py-2"
              >
                Ingresar como centro de acopio
              </Button>
            </form>
          </div>

          {/* --- Registration Request --- */}
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
                Solicitar registro como centro de acopio
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
