"use client"

import { useProductForm } from "../hooks/useProductForm";
import { ProductFormUI } from "./productFormUI";

interface Product {
    id: number;
    imagen: string;
    titulo: string;
    descripcion: string;
    costo: number;
}

interface ProductFormProps {
    product?: Product;                           // Producto a editar (opcional)
    mode?: 'create' | 'edit';                  // Modo (auto-detecta si no se especifica)
    onSave?: (product: Product) => void;       // Callback al guardar
    onDelete?: (productId: number) => void;    // Callback al eliminar
}

export const ProductForm = ({ 
    product, 
    mode = product ? 'edit' : 'create',  // Auto-detectar modo
    onSave,
    onDelete 
}: ProductFormProps) => {
    
    // 🧠 Usar el hook con la lógica
    const formLogic = useProductForm({
        initialProduct: product,
        mode,
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