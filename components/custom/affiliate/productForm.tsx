"use client"

import { useProductForm } from "../hooks/useProductForm";
import { ProductFormUI } from "./productFormUI";

interface Product {
    id: string;
    relId?: string;
    imagen: string;
    titulo: string;
    descripcion: string;
    costo: number;
}

interface ProductFormProps {
    product?: Product;                           // Producto a editar (opcional)
    mode?: 'create' | 'edit';                  // Modo (auto-detecta si no se especifica)
    businessId?: string;                        // ID del negocio afiliado
    onSave?: (product: Product) => void;       // Callback al guardar
    onDelete?: (productId: string) => void;    // Callback al eliminar
}

export const ProductForm = ({ 
    product, 
    mode = product ? 'edit' : 'create',  // Auto-detectar modo
    businessId,
    onSave,
    onDelete 
}: ProductFormProps) => {
    
    // 🧠 Usar el hook con la lógica
    const formLogic = useProductForm({
        initialProduct: product,
        mode,
        businessId,
        onSave,
        onDelete
    });

    // 🎨 Renderizar la UI pasándole toda la lógica
    return (
        <ProductFormUI 
            {...formLogic}  // Spread todas las propiedades del hook
            mode={mode}     // Agregar el modo
        />
    );
};