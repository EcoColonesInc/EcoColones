"use client"
import React from "react";    
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Product {
    id: number;
    imagen: string;
    titulo: string;
    descripcion: string;
    costo: number;
}

interface DashProductsProps {
    products: Product[];
}

export const DashProducts: React.FC<DashProductsProps> = ({ products }) => {
    const router = useRouter();
    
    const handleEdit = (productId: string) => {
        router.push(`/products/${productId}/edit`);
    };

return (
    <div className="bg-green-50 max-h-96 overflow-y-auto p-4 rounded-lg border border-gray-300">
        
        {products.length > 0 ? (
            <div className="space-y-3">
                {products.map((product) => (
                    <Card key={product.id} className="p-6 bg-white hover:shadow-md transition-shadow mx-4">
                        <div className="flex items-center gap-4">
                            {/* Imagen del producto */}
                            <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                                <Image 
                                    src={product.imagen} 
                                    alt={product.titulo}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            {/* Información del producto */}
                            <div className="flex-grow min-w-0">
                                <h4 className="font-semibold text-lg text-gray-800 truncate">
                                    {product.titulo}
                                </h4>
                                <p className="text-sm text-gray-600 line-clamp-2">
                                    {product.descripcion}
                                </p>
                                <p className="text-green-700 font-bold mt-1">
                                    {product.costo} EcoColones
                                </p>
                            </div>

                            {/* Botón de editar */}
                            <Button 
                                onClick={() => handleEdit((product.id).toString())}
                                className="bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0"
                            >
                                Editar
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        ) : (
            <p className="text-gray-500 text-center py-8">No hay productos disponibles</p>
        )}
    </div>  
);  
};
