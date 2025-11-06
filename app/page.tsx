import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Recycle, Coins, Store, User } from "lucide-react";
import Link from "next/link";
import { AUTH_ROUTES } from "@/config/routes";

export default function Home() {
  return (
    <div className="space-y-12 md:space-y-20 m-2 sm:m-5">
      {/* Hero Section with Background */}
      <div 
        className="relative min-h-[300px] sm:min-h-[400px] md:min-h-[500px] flex items-center justify-center bg-cover bg-center rounded-lg overflow-hidden"
        style={{ backgroundImage: 'url(backgrounds/home.jpg)' }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center text-white px-4 sm:px-6 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">Reciclá, Ganá y Canjeá</h1>
          <p className="text-base sm:text-lg md:text-xl">Únete a EcoColones y convertí tus materiales reciclables en recompensas. Ganá puntos por cada artículo que recicles y canjealos en tus comercios locales favoritos.</p>
          <Link
                href={AUTH_ROUTES.SIGNUP}
              ><Button variant="default" size="lg" className="mt-6 sm:mt-8 rounded-4xl">¡Unete Ahora!</Button>
        </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 space-y-12 md:space-y-20">
      {/* Cómo funciona SECTION */}
      <div id="about">
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">!Da tus primeros pasos hacia un futuro más verde!</h2>
          <p className="text-base sm:text-lg md:text-xl">Reciclá, Ganá y Repetí. Con EcoColones, cada acción cuenta.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <Card className="h-full p-6 hover:shadow-lg transition-shadow">
            <Recycle className="mb-4 size-12 text-primary" />
            <h3 className="text-xl font-bold mb-3">Reciclá tus materiales</h3>
            <p className="text-muted-foreground">Lleva tus materiales reciclables a nuestros centros de acopio asociados.</p>
          </Card>
          <Card className="h-full p-6 hover:shadow-lg transition-shadow">
            <Coins className="mb-4 size-12 text-primary" />
            <h3 className="text-xl font-bold mb-3">Ganá puntos</h3>
            <p className="text-muted-foreground">Por cada kilogramo de material reciclado, acumula EcoColones que puedes canjear.</p>
          </Card>
          <Card className="h-full p-6 hover:shadow-lg transition-shadow">
            <Store className="mb-4 size-12 text-primary" />
            <h3 className="text-xl font-bold mb-3">Canjeá en comercios</h3>
            <p className="text-muted-foreground">Utiliza tus EcoColones en comercios locales para obtener descuentos y promociones.</p>
          </Card>
        </div>


      </div>

      {/* Por que unirse SECTION */}
      <div>
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">En EcoColones: ¡Todos Ganamos!</h2>
          <p className="text-base sm:text-lg md:text-xl">Descubrí las ventajas de participar en la plataforma EcoColones para comercios, centros de acopio y la comunidad.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <Card className="h-full p-6 hover:shadow-lg transition-shadow">
            <User className="mb-4 size-12 text-primary" />
            <h3 className="text-xl font-bold mb-3">Usuarios</h3>
            <p className="text-muted-foreground">Gana recompensas por reciclar, ahorra dinero en negocios locales y contribuye a un planeta más saludable</p>
          </Card>
          <Card className="h-full p-6 hover:shadow-lg transition-shadow">
            <Store className="mb-4 size-12 text-primary" />
            <h3 className="text-xl font-bold mb-3">Negocios</h3>
            <p className="text-muted-foreground">Atrae nuevos clientes, aumenta el tráfico en tu local y mejora la imagen de sostenibilidad de tu marca.</p>
          </Card>
          <Card className="h-full p-6 hover:shadow-lg transition-shadow">
            <Recycle className="mb-4 size-12 text-primary" />
            <h3 className="text-xl font-bold mb-3">Centros de Acopio</h3>
            <p className="text-muted-foreground">Incrementa el volumen de reciclaje, optimiza las operaciones y apoya las iniciativas de reciclaje en la comunidad.</p>
          </Card>
        </div>
      </div>

      {/* READY TO JOIN SECTION */}
      <div className="py-12 px-6 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">¿Listo para hacer la diferencia?</h2>
        <p>Registrate en EcoColones hoy y comenzá a ganar recompensas por tus esfuerzos en el cuidado al planeta.</p>
        <Link
                href={AUTH_ROUTES.SIGNUP}
              ><Button variant="default" size="lg" className="mt-6 sm:mt-8 rounded-4xl">¡Unete Ahora!</Button>
        </Link>
      </div>
    </div>
  </div>

  );
}
