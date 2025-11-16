"use client";

export default function centersFromUser() {
  return (
    <div className="min-h-screen bg-white py-10 px-6 md:px-16">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* --- Title --- */}
        <h1 className="text-4xl font-bold text-center md:text-left">
          Centros de acopio
        </h1>

        {/* --- Map Section --- */}
        <section>
          <h2 className="text-xl font-semibold mb-4">
            Mapa de centros de acopio
          </h2>

          <div className="w-full h-[400px] mb-10 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
            <iframe
              title="Mapa de centros de acopio"
              src="https://www.google.com/maps/d/u/0/embed?mid=1kR8Ub9Fvzel6juFjy4bGn8KszPy8Ggk&ehbc=2E312F&noprof=1"
              width="100%"
              height="100%"
              allowFullScreen
              loading="lazy"
              className="border-none"
            ></iframe>
          </div>
        </section>

        {/* --- List Section --- */}
        <section>
          <h2 className="text-xl font-semibold mb-4">
            Lista de centros de acopio
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Center 1 */}
            <div>
              <h3 className="font-semibold text-lg">Acopio La GASELSJ</h3>
              <p className="text-gray-700">
                Ubicado en Barrio Amón, San José, Costa Rica
              </p>
              <p className="text-gray-700">Número: 4444 0000</p>
            </div>

            {/* Center 2 */}
            <div>
              <h3 className="font-semibold text-lg">Acopio La Carpio</h3>
              <p className="text-gray-700">
                Ubicado en Carpio, Pavas, San José, Costa Rica
              </p>
              <p className="text-gray-700">Número: 6666 6666</p>
            </div>

            {/* Center 3 */}
            <div>
              <h3 className="font-semibold text-lg">Acopio El Pínto</h3>
              <p className="text-gray-700">
                Ubicado en Pueblo, Pérez Zeledón, San José, Costa Rica
              </p>
              <p className="text-gray-700">Número: 8764 7483</p>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
}
