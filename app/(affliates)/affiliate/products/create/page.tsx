"use client"
import { ProductForm } from "@/components/custom/affiliate/productForm";
import { Info, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface Product {
    id: number;
    imagen: string;
    titulo: string;
    descripcion: string;
    costo: number;
}

export default function CreateProductPage() {
    const router = useRouter();

    const handleProductSave = async (newProduct: Product) => {

        console.log('Nuevo producto creado:', newProduct);
        
        // TODO:Llamada a la API para guardar en BD
        
        // Simular guardado exitoso y redirigir
        setTimeout(() => {
            router.push('/affiliate/products/create');
        }, 2000);
    };

    return (
        <div className="container mx-auto px-4 space-y-8 md:space-y-12">
            {/* Header de la página */}
            <div className="pt-8 md:pt-10">
                <div className="flex items-center gap-4 mb-4">
                    {/* Botón de regreso */}
                    <button
                        onClick={() => router.back()}
                        className="text-green-600 hover:text-green-800 transition-colors"
                        aria-label="Volver atrás"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                            Agregar Nuevo Producto
                        </h1>
                        <p className="text-sm md:text-lg text-gray-600 mt-1">
                            Completa la información del nuevo producto que quieres ofrecer
                        </p>
                    </div>
                </div>
            </div>

            {/* Formulario de creación */}
            <div className="w-full">
                <ProductForm 
                    mode="create"
                    onSave={handleProductSave}
                />
            </div>

            {/* Información adicional o ayuda (opcional) */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                        <h3 className="text-sm font-semibold text-blue-800 mb-1">
                            Tips para un buen producto
                        </h3>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Usa una imagen clara y atractiva</li>
                            <li>• Escribe una descripción detallada</li>
                            <li>• Establece un precio competitivo</li>
                            <li>• Revisa la información antes de guardar</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );

}