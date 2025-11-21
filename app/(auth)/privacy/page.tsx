import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white py-10 px-6 md:px-16">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Política de Privacidad</h1>
          <p className="text-sm text-gray-600">Última actualización: 20 de noviembre de 2025</p>
        </div>

        <div className="space-y-6 text-gray-700">
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">1. Introducción</h2>
            <p>
              En EcoColones, nos comprometemos a proteger su privacidad y a tratar sus datos personales de manera 
              responsable y transparente. Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos 
              y protegemos su información cuando utiliza nuestra plataforma.
            </p>
            <p>
              Al utilizar EcoColones, usted acepta las prácticas descritas en esta política. Si no está de acuerdo 
              con nuestras políticas y prácticas, no use nuestra plataforma.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">2. Información que Recopilamos</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">2.1 Información que Usted Proporciona</h3>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Información de registro: nombre, apellido, correo electrónico, contraseña</li>
                  <li>Información de perfil: foto de perfil, preferencias de usuario</li>
                  <li>Información de contacto: número de teléfono, dirección</li>
                  <li>Información de transacciones: registros de reciclaje, canjes de puntos</li>
                  <li>Comunicaciones: mensajes, consultas o comentarios que nos envíe</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">2.2 Información Recopilada Automáticamente</h3>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Datos de uso: páginas visitadas, tiempo de uso, interacciones con la plataforma</li>
                  <li>Información del dispositivo: tipo de dispositivo, sistema operativo, navegador</li>
                  <li>Datos de ubicación: ubicación geográfica (con su consentimiento)</li>
                  <li>Cookies y tecnologías similares: identificadores únicos, preferencias</li>
                  <li>Dirección IP y datos de conexión</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">3. Cómo Usamos su Información</h2>
            <p>Utilizamos la información recopilada para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Proporcionar, mantener y mejorar nuestros servicios</li>
              <li>Procesar sus transacciones y gestionar su cuenta</li>
              <li>Calcular y acreditar EcoColones según sus actividades de reciclaje</li>
              <li>Personalizar su experiencia en la plataforma</li>
              <li>Enviar notificaciones sobre su cuenta y actualizaciones del servicio</li>
              <li>Responder a sus consultas y proporcionar soporte al cliente</li>
              <li>Detectar, prevenir y abordar problemas técnicos y de seguridad</li>
              <li>Realizar análisis y estudios sobre el uso de la plataforma</li>
              <li>Cumplir con obligaciones legales y regulatorias</li>
              <li>Enviar comunicaciones de marketing (con su consentimiento)</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">4. Compartir su Información</h2>
            <p>Podemos compartir su información con:</p>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">4.1 Centros de Acopio y Negocios Afiliados</h3>
                <p className="mt-2">
                  Compartimos información necesaria con centros de acopio y negocios afiliados para procesar sus 
                  transacciones y canjes de puntos.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">4.2 Proveedores de Servicios</h3>
                <p className="mt-2">
                  Trabajamos con proveedores de servicios que nos ayudan a operar la plataforma (hosting, análisis, 
                  procesamiento de pagos, etc.).
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">4.3 Cumplimiento Legal</h3>
                <p className="mt-2">
                  Podemos divulgar su información si es requerido por ley o en respuesta a procesos legales válidos.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">4.4 Transferencias de Negocio</h3>
                <p className="mt-2">
                  En caso de fusión, adquisición o venta de activos, su información puede ser transferida.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">5. Seguridad de los Datos</h2>
            <p>
              Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger su información 
              contra acceso no autorizado, alteración, divulgación o destrucción:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cifrado de datos en tránsito y en reposo</li>
              <li>Controles de acceso estrictos</li>
              <li>Auditorías de seguridad regulares</li>
              <li>Capacitación en seguridad para el personal</li>
              <li>Monitoreo continuo de amenazas</li>
            </ul>
            <p className="mt-3">
              Sin embargo, ningún método de transmisión por Internet o almacenamiento electrónico es 100% seguro. 
              Aunque nos esforzamos por usar medios comercialmente aceptables para proteger su información, no 
              podemos garantizar su seguridad absoluta.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">6. Sus Derechos</h2>
            <p>Usted tiene los siguientes derechos respecto a su información personal:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Acceso:</strong> Solicitar una copia de los datos personales que tenemos sobre usted</li>
              <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
              <li><strong>Eliminación:</strong> Solicitar la eliminación de sus datos personales</li>
              <li><strong>Restricción:</strong> Limitar el procesamiento de sus datos</li>
              <li><strong>Portabilidad:</strong> Recibir sus datos en un formato estructurado y legible</li>
              <li><strong>Oposición:</strong> Oponerse al procesamiento de sus datos para ciertos fines</li>
              <li><strong>Revocación del consentimiento:</strong> Retirar su consentimiento en cualquier momento</li>
            </ul>
            <p className="mt-3">
              Para ejercer estos derechos, contáctenos en info@ecocolones.com
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">7. Retención de Datos</h2>
            <p>
              Conservamos su información personal durante el tiempo necesario para cumplir con los propósitos 
              descritos en esta política, a menos que la ley requiera o permita un período de retención más largo:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Datos de cuenta: mientras su cuenta esté activa</li>
              <li>Datos de transacciones: 7 años para fines contables y legales</li>
              <li>Datos de marketing: hasta que retire su consentimiento</li>
              <li>Datos de auditoría: según requisitos legales</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">8. Cookies y Tecnologías de Rastreo</h2>
            <p>
              Utilizamos cookies y tecnologías similares para mejorar su experiencia:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Cookies esenciales:</strong> Necesarias para el funcionamiento de la plataforma</li>
              <li><strong>Cookies de rendimiento:</strong> Para analizar cómo se usa la plataforma</li>
              <li><strong>Cookies de funcionalidad:</strong> Para recordar sus preferencias</li>
              <li><strong>Cookies de publicidad:</strong> Para mostrar anuncios relevantes</li>
            </ul>
            <p className="mt-3">
              Puede gestionar sus preferencias de cookies en la configuración de su navegador.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">9. Menores de Edad</h2>
            <p>
              Nuestra plataforma no está dirigida a menores de 13 años. No recopilamos intencionalmente información 
              personal de niños menores de 13 años. Si descubrimos que un menor de 13 años nos ha proporcionado 
              información personal, eliminaremos dicha información de nuestros sistemas.
            </p>
            <p className="mt-3">
              Los usuarios entre 13 y 18 años deben tener el consentimiento de sus padres o tutores para usar 
              la plataforma.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">10. Transferencias Internacionales</h2>
            <p>
              Sus datos pueden ser transferidos y almacenados en servidores ubicados fuera de su país de residencia. 
              Tomamos medidas para garantizar que sus datos reciban un nivel adecuado de protección de acuerdo con 
              esta política y las leyes aplicables.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">11. Cambios a esta Política</h2>
            <p>
              Podemos actualizar nuestra Política de Privacidad periódicamente. Le notificaremos sobre cambios 
              significativos publicando la nueva política en esta página y actualizando la fecha de &quot;Última 
              actualización&quot; en la parte superior.
            </p>
            <p className="mt-3">
              Se le recomienda revisar esta Política de Privacidad periódicamente para estar informado sobre 
              cómo protegemos su información.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">12. Contacto</h2>
            <p>
              Si tiene preguntas, inquietudes o solicitudes relacionadas con esta Política de Privacidad o 
              nuestras prácticas de manejo de datos, puede contactarnos en:
            </p>
            <ul className="list-none pl-0 space-y-2 mt-3">
              <li><strong>Email:</strong> ecocolones@gmail.com</li>
              <li><strong>Sitio web:</strong> www.eco-colones.vercel.app</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">13. Consentimiento</h2>
            <p>
              Al usar nuestra plataforma, usted reconoce que ha leído y comprendido esta Política de Privacidad 
              y consiente la recopilación, uso y divulgación de su información personal como se describe aquí.
            </p>
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
