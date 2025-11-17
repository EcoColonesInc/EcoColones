"use client"

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Toast, useToast } from "@/components/ui/toast";
import Image from "next/image";

interface Product {
    id: number;
    imagen: string;
    titulo: string;
    descripcion: string;
    costo: number;
}

interface ProductDisplayProps {
    product: Product;
}

export const ProductDisplay = ({ product }: ProductDisplayProps) => {
    const [formData, setFormData] = useState({
        titulo: product.titulo,
        costo: product.costo,
        descripcion: product.descripcion,
        imagen: product.imagen
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        return () => {
            // Limpiar URL de objeto para evitar memory leaks
            if (formData.imagen && formData.imagen.startsWith('blob:')) {
                URL.revokeObjectURL(formData.imagen);
            }
        };
    }, [formData.imagen]);

    
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        if (window.confirm('¿Estás seguro de que quieres modificar este producto?')) {
            try{    
                if (selectedFile) {
                //Si se selecciona un archivo, deberia subirse al servidor o servicio de almacenamiento
                console.log('Archivo seleccionado para subir:', selectedFile);
                }

                console.log('Datos a guardar:', formData);
                // TODO: Aquí irá la lógica para guardar en la BD

                showToast("Producto guardado exitosamente", "success");

                } catch (error) {
                    console.error('Error al guardar:', error);
                    showToast("Error al guardar el producto", "error");
                } finally {
                    setIsLoading(false);
                }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'costo' ? Number(value) : value
        }));
    };

    const handleDelete = async () => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.')) {
            setIsLoading(true);
            try {
                console.log('Eliminar producto con ID:', product.id);
                // TODO: Implementar lógica de eliminación
                
                // Simular eliminación
                //await new Promise(resolve => setTimeout(resolve, 1000));
                showToast("Producto eliminado exitosamente", "success");
                
            } catch (error) {
                console.error('Error al eliminar:', error);
                showToast("Error al eliminar el producto", "error");
            } finally {
                setIsLoading(false);
            }
        }
    };

    
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

            // Validar tipo y tamaño de archivo
        if (!file.type.startsWith('image/')) {
            alert('Por favor selecciona un archivo de imagen válido');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB max
            alert('El archivo es muy grande. Máximo 5MB');
            return;
        }

        setSelectedFile(file)
        // Vista previa de la imagen seleccionada
        const previewImage = URL.createObjectURL(file);
        setFormData(prev => ({ ...prev, imagen: previewImage }));
        };

    
    return (
        <>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    duration={toast.duration}
                    onClose={hideToast}
                />
        )}
        <div className="bg-green-50 p-6 rounded-lg border-2 border-green-300 shadow-lg">
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                {/* Contenedor centrado con flex en fila (responsive) */}
                <div className="flex flex-col md:flex-row items-start justify-center gap-6 mx-4 md:mx-8 lg:mx-12">

                    {/* Spacer izquierdo (solo en desktop) */}
                    <div className="hidden md:block md:w-1/12" />

                    {/* Columna imagen (central izquierda) */}
                    <div className="w-full md:w-5/12 flex flex-col items-center space-y-4">
                        <div className="relative w-64 h-64 rounded-lg overflow-hidden bg-gray-100 border-2 border-green-300">
                            <Image
                                src={formData.imagen}
                                alt={formData.titulo}
                                fill
                                className="object-cover"
                            />
                        </div>

                        <div className="w-64">
                            <Label htmlFor="imagen-file" className="block text-sm font-semibold mb-2">
                                Cambiar Imagen
                            </Label>
                            <Input
                                id="imagen-file"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="bg-white border-green-300 cursor-pointer w-64 "
                            />
                        </div>
                    </div>

                    {/* Columna inputs (central derecha) */}
                    <div className="w-full md:w-5/12">
                        <h1 className="text-2xl font-bold mb-4">Editar Producto</h1>

                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <Label htmlFor="titulo" className="block text-sm font-semibold mb-2">
                                    Nombre del Producto
                                </Label>
                                <Input
                                    id="titulo"
                                    name="titulo"
                                    value={formData.titulo}
                                    onChange={handleChange}
                                    placeholder="Ingresa el nombre del producto"
                                    className="bg-white border-green-300 focus:ring-green-500 w-full"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="costo" className="block text-sm font-semibold mb-2">
                                    Precio
                                </Label>
                                <Input
                                    id="costo"
                                    name="costo"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={String(formData.costo)}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    className="bg-white border-green-300 focus:ring-green-500 w-full"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="descripcion" className="block text-sm font-semibold mb-2">
                                    Descripción
                                </Label>
                                <Textarea
                                    id="descripcion"
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    placeholder="Ingresa la descripción del producto"
                                    className="bg-white border-green-300 focus:ring-green-500 w-full max-h-40"
                                    required
                                />
                            </div>

                            <div className="flex gap-4 pt-2">
                                <Button
                                    type="button"
                                    onClick={handleDelete}
                                    variant="destructive"
                                    className="bg-red-600 hover:bg-red-700 text-white flex-1"
                                >
                                    Eliminar
                                </Button>
                                    <Button
                                    type="submit"
                                    className="bg-green-600 hover:bg-green-700 text-white flex-1"
                                >
                                    Guardar
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Spacer derecho (solo en desktop) */}
                    <div className="hidden md:block md:w-1/12" />
                </div>
            </form>
        </div>
        </>
    );
};