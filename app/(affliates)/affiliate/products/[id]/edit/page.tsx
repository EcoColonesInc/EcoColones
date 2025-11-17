"use client"

import { useState, useEffect } from "react";
import { mockProducts } from "@/app/mockups/mockups";
import { ProductDisplay } from "@/components/custom/affiliate/productDisplay";
import { DashProducts } from "@/components/custom/affiliate/dashProducts";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const [products, setProducts] = useState(mockProducts);
    const [currentId, setCurrentId] = useState<string>("");
    
    useEffect(() => {
        params.then(({ id }) => setCurrentId(id));
    }, [params]);
    
    const handleProductChange = () => {
        // llamado al api para actualizar productos
        setProducts([...mockProducts]);
    };

    const currentProduct = products.find(p => p.id.toString() === currentId);
    
    if (!currentProduct) {
        return (
            <div className="container mx-auto px-4 py-10">
                <h1 className="text-3xl font-bold text-red-600">Producto no encontrado</h1>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 space-y-12 md:space-y-20">
            <div>
                <h1 className="text-3xl font-bold mb-4 pt-10">Editar Producto</h1>
                <ProductDisplay 
                    product={currentProduct}
                />
            </div>   
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Productos disponibles en el sistema</h2>
                <DashProducts products={products} />
            </div>
        </div>
    );
}