"use client"
import { ProductForm } from "@/components/custom/affiliate/productForm";
import { Info, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function CreateProductPage() {
    const router = useRouter();
    const [businessId, setBusinessId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBusinessId = async () => {
            try {
                const supabase = createClient();
                
                // Get current user
                const { data: { user }, error: authError } = await supabase.auth.getUser();
                
                if (authError || !user) {
                    setError("Usuario no autenticado. Por favor, inicia sesión.");
                    setLoading(false);
                    return;
                }

                // Get affiliated business for this user
                const { data, error: businessError } = await supabase
                    .from('affiliatedbusiness')
                    .select('affiliated_business_id, affiliated_business_name')
                    .eq('manager_id', user.id)
                    .single();
                
                if (businessError || !data) {
                    setError(businessError?.message || "No se encontró un negocio afiliado para este usuario.");
                    setLoading(false);
                    return;
                }
                
                setBusinessId(data.affiliated_business_id);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching business:", err);
                setError("Error al cargar la información del negocio.");
                setLoading(false);
            }
        };

        fetchBusinessId();
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-10">
                <p className="text-gray-600">Cargando...</p>
            </div>
        );
    }

    if (error || !businessId) {
        return (
            <div className="container mx-auto px-4 py-10">
                <h1 className="text-3xl font-bold text-red-600">Error</h1>
                <p className="text-red-600 mt-4">{error || "No se pudo cargar la información del negocio."}</p>
                <button 
                    onClick={() => router.back()} 
                    className="mt-4 text-green-600 hover:text-green-800"
                >
                    ← Volver
                </button>
            </div>
        );
    }

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
                    businessId={businessId}
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