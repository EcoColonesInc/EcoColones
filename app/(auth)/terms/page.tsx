import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white py-10 px-6 md:px-16">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Términos y Condiciones</h1>
          <p className="text-sm text-gray-600">Última actualización: 20 de noviembre de 2025</p>
        </div>

        <div className="space-y-6 text-gray-700">
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">1. Aceptación de los Términos</h2>
            <p>
              Al acceder y utilizar la plataforma EcoColones, usted acepta estar sujeto a estos Términos y Condiciones, 
              todas las leyes y regulaciones aplicables, y acepta que es responsable del cumplimiento de las leyes locales 
              aplicables. Si no está de acuerdo con alguno de estos términos, está prohibido usar o acceder a este sitio.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">2. Descripción del Servicio</h2>
            <p>
              EcoColones es una plataforma digital que facilita el reciclaje y la gestión de residuos, conectando a usuarios 
              con centros de acopio y negocios afiliados. Los usuarios pueden:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Registrar materiales reciclables y acumular puntos (EcoColones)</li>
              <li>Localizar centros de acopio cercanos</li>
              <li>Canjear puntos por productos o servicios en negocios afiliados</li>
              <li>Calcular el impacto ambiental de sus actividades de reciclaje</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">3. Registro de Usuario</h2>
            <p>
              Para utilizar ciertos servicios de EcoColones, debe registrarse y crear una cuenta. Al registrarse, usted se compromete a:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Proporcionar información precisa, actualizada y completa</li>
              <li>Mantener la seguridad de su contraseña</li>
              <li>Notificar inmediatamente cualquier uso no autorizado de su cuenta</li>
              <li>Ser responsable de todas las actividades que ocurran bajo su cuenta</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">4. Sistema de Puntos (EcoColones)</h2>
            <p>
              Los EcoColones son puntos virtuales que se acumulan mediante actividades de reciclaje:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Los puntos se otorgan según el tipo y cantidad de materiales reciclados</li>
              <li>Los puntos no tienen valor monetario y no pueden ser intercambiados por dinero</li>
              <li>Los puntos pueden canjearse por productos o servicios en negocios afiliados</li>
              <li>EcoColones se reserva el derecho de modificar las tasas de conversión de puntos</li>
              <li>Los puntos pueden expirar según las políticas establecidas</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">5. Uso Aceptable</h2>
            <p>
              Al utilizar EcoColones, usted acepta NO:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Usar el servicio para cualquier propósito ilegal o no autorizado</li>
              <li>Intentar obtener acceso no autorizado a la plataforma o sistemas relacionados</li>
              <li>Proporcionar información falsa sobre materiales reciclados</li>
              <li>Transferir, vender o comercializar su cuenta sin autorización</li>
              <li>Interferir con el funcionamiento adecuado de la plataforma</li>
              <li>Realizar actividades fraudulentas para acumular puntos</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">6. Centros de Acopio y Negocios Afiliados</h2>
            <p>
              EcoColones actúa como intermediario entre usuarios y centros de acopio/negocios afiliados. 
              No somos responsables de:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La disponibilidad, calidad o condiciones de los servicios de terceros</li>
              <li>Disputas entre usuarios y centros de acopio o negocios afiliados</li>
              <li>La exactitud de la información proporcionada por terceros</li>
              <li>Cambios en los horarios, ubicaciones o servicios ofrecidos por terceros</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">7. Propiedad Intelectual</h2>
            <p>
              Todo el contenido de la plataforma EcoColones, incluyendo pero no limitado a textos, gráficos, logos, 
              iconos, imágenes, clips de audio y software, es propiedad de EcoColones o sus proveedores de contenido 
              y está protegido por las leyes de propiedad intelectual aplicables.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">8. Limitación de Responsabilidad</h2>
            <p>
              EcoColones no será responsable por daños indirectos, incidentales, especiales, consecuentes o punitivos, 
              incluyendo pero no limitado a pérdida de beneficios, datos, uso, o cualquier pérdida intangible, 
              resultante de:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El uso o la imposibilidad de usar el servicio</li>
              <li>Cualquier conducta o contenido de terceros en el servicio</li>
              <li>Acceso no autorizado, uso o alteración de sus transmisiones o contenido</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">9. Modificaciones del Servicio</h2>
            <p>
              EcoColones se reserva el derecho de modificar o discontinuar, temporal o permanentemente, el servicio 
              (o cualquier parte del mismo) con o sin previo aviso. No seremos responsables ante usted o terceros 
              por cualquier modificación, suspensión o discontinuación del servicio.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">10. Terminación</h2>
            <p>
              Podemos terminar o suspender su cuenta y prohibir el acceso al servicio inmediatamente, sin previo aviso 
              o responsabilidad, bajo nuestra sola discreción, por cualquier motivo y sin limitación, incluyendo pero 
              no limitado al incumplimiento de los Términos y Condiciones.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">11. Ley Aplicable</h2>
            <p>
              Estos términos se regirán e interpretarán de acuerdo con las leyes de Costa Rica, sin tener en cuenta 
              sus disposiciones sobre conflictos de leyes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">12. Cambios en los Términos</h2>
            <p>
              Nos reservamos el derecho, a nuestra sola discreción, de modificar o reemplazar estos Términos en cualquier 
              momento. Si una revisión es material, intentaremos proporcionar un aviso con al menos 30 días de anticipación 
              antes de que los nuevos términos entren en vigencia.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">13. Contacto</h2>
            <p>
              Si tiene alguna pregunta sobre estos Términos y Condiciones, puede contactarnos en:
            </p>
            <ul className="list-none pl-0 space-y-2">
              <li>Email: ecocolones@gmail.com</li>
              <li>Sitio web: www.eco-colones.vercel.app</li>
            </ul>
          </section>
        </div>

        <div className="pt-8 border-t">
          <Link href="/signup">
            <Button variant="outline">Volver al registro</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
