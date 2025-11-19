import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Toast } from "@/components/ui/toast";
import Image from "next/image";

interface ToastState {
    message: string;
    type: "success" | "error" | "warning" | "info";
    duration?: number;
}

interface ProductFormUIProps {
    formData: {
        titulo: string;
        costo: number;
        descripcion: string;
        imagen: string;
    };
    selectedFile: File | null;
    isLoading: boolean;
    toast: ToastState | null;
    
    // Funciones
    handleSubmit: (event: React.FormEvent) => void;
    handleDelete: () => void;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    hideToast: () => void;
    
    // Opciones
    mode: 'create' | 'edit';
}

export const ProductFormUI = ({
    formData,
    isLoading,
    toast,
    handleSubmit,
    handleDelete,
    handleChange,
    handleImageChange,
    hideToast,
    mode
}: ProductFormUIProps) => {
    
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
                <form onSubmit={handleSubmit} >
                    <div className="flex flex-col md:flex-row items-start justify-center gap-6 mx-4 md:mx-8 lg:mx-12">
                        
                        {/* Spacer izquierdo */}
                        <div className="hidden md:block md:w-1/12" />

                        {/* Columna imagen */}
                        <div className="w-full md:w-5/12 flex flex-col items-center space-y-4">
                            <div className="relative w-64 h-64 rounded-lg overflow-hidden bg-gray-100 border-2 border-green-300">
                                <Image
                                    src={formData.imagen}
                                    alt={formData.titulo || "Producto"}
                                    sizes="256"
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            <div className="w-64">
                                <Label htmlFor="imagen-file" className="block text-sm font-semibold mb-2">
                                    {mode === 'create' ? 'Seleccionar Imagen' : 'Cambiar Imagen'}
                                </Label>
                                <Input
                                    id="imagen-file"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="bg-white border-green-300 cursor-pointer w-64"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Columna inputs */}
                        <div className="w-full md:w-5/12">

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
                                        disabled={isLoading}
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
                                        disabled={isLoading}
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
                                        disabled={isLoading}
                                        required
                                    />
                                </div>

                                <div className="flex gap-4 pt-2">
                                    {mode === 'edit' && (
                                        <Button
                                            type="button"
                                            onClick={handleDelete}
                                            variant="destructive"
                                            disabled={isLoading}
                                            className="bg-red-600 hover:bg-red-700 text-white flex-1"
                                        >
                                            {isLoading ? "Eliminando..." : "Eliminar"}
                                        </Button>
                                    )}
                                    
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`bg-green-600 hover:bg-green-700 text-white ${
                                            mode === 'edit' ? 'flex-1' : 'w-full'
                                        }`}
                                    >
                                        {isLoading 
                                            ? (mode === 'create' ? "Creando..." : "Guardando...")
                                            : (mode === 'create' ? "Crear Producto" : "Guardar Cambios")
                                        }
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Spacer derecho */}
                        <div className="hidden md:block md:w-1/12" />
                    </div>
                </form>
            </div>
        </>
    );
};