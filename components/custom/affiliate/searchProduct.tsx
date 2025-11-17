"use client"

import { useState } from "react";
import { Input } from "@/components/ui/input";
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
    state?: boolean;
}

interface ProductSearchProps {
    products: Product[];
}
    
export const ProductSearch = ({ products }: ProductSearchProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [productList, setProductList] = useState<Product[]>(products);
    const router = useRouter();

    const handleState = (productId: number) => {
        setProductList(prevProducts => 
            prevProducts.map(p => 
                p.id === productId 
                    ? { ...p, state: !p.state }
                    : p
            )
        );
    };

    // Filtrar productos según lo que se busque
    const filteredProducts = productList.filter(product =>
        product.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container space-y-6">
            {/* Barra de búsqueda */}
            <div className="flex justify-center">
            <Input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md mx-auto bg-green-100 border-green-500 rounded-full "
            />
            </div>
            {/* Grid de productos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-250 overflow-y-auto">
                {filteredProducts.map((product) => (
                    
                    <Card key={product.id} className={`p-6 hover:shadow-lg transition-shadow ${product.state === false ? "bg-gray-200" : "bg-white"}`}>
                        <div className="space-y-4">
                            {/* Imagen */}
                            <div className="relative w-full h-48 rounded-md overflow-hidden bg-gray-100">
                                <Image
                                    src={product.imagen}
                                    alt={product.titulo}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            {/* Información */}
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg">{product.titulo}</h3>
                                <p className="text-sm text-gray-600 line-clamp-2">
                                    {product.descripcion}
                                </p>
                                <p className="text-green-700 font-bold text-xl">
                                    {product.costo} EcoColones
                                </p>
                            </div>

                            {/* Botones */}
                            <div className="flex gap-2">
                                {product.state === false ? (
                                    <Button 
                                        onClick={() => handleState(product.id)}
                                        className="flex-1 bg-green-300 hover:bg-green-700"
                                    >
                                        Activar
                                    </Button>
      
                                ) : (<>
                                    <Button 
                                        onClick={() => handleState(product.id)}
                                        className="flex-1 bg-yellow-300 hover:bg-yellow-700"
                                    >
                                        Desactivar
                                    </Button>
                                        
                                    <Button 
                                        onClick={() => router.push(`/affiliate/products/${product.id}/edit`)}
                                        className="flex-1 bg-green-300 hover:bg-green-700"
                                    >
                                        Editar
                                    </Button>
                                </>

                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Mensaje si no hay resultados */}
            {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">
                        {searchTerm 
                            ? `No se encontraron productos con "${searchTerm}"`
                            : "No hay productos disponibles"
                        }
                    </p>
                </div>
            )}

            {/* Contador de resultados */}
            {searchTerm && filteredProducts.length > 0 && (
                <p className="text-sm text-gray-600">
                    Mostrando {filteredProducts.length} de {products.length} productos
                </p>
            )}
        </div>
    );
}

