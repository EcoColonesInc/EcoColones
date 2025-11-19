import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/components/ui/toast';

interface Product {
    id: number;
    imagen: string;
    titulo: string;
    descripcion: string;
    costo: number;
}

interface UseProductFormProps {
    initialProduct?: Product;           // Producto a editar (opcional)
    mode: 'create' | 'edit';           // Modo del formulario
    onSave?: (product: Product) => void;    // Callback cuando guarda
    onDelete?: (productId: number) => void; // Callback cuando elimina
}

export const useProductForm = ({ initialProduct, mode, onSave, onDelete }: UseProductFormProps) => {

    //Si viene un producto inicial, lo usamos para llenar el 
    const [formData, setFormData] = useState({
        imagen: initialProduct?.imagen || '/placeholder.jpg',
        titulo: initialProduct?.titulo || '',
        descripcion: initialProduct?.descripcion || '',
        costo: initialProduct?.costo || 0,
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast, showToast, hideToast } = useToast();


    useEffect(() => {
        if (initialProduct) {
            setFormData({
                titulo: initialProduct.titulo,
                costo: initialProduct.costo,
                descripcion: initialProduct.descripcion,
                imagen: initialProduct.imagen
            });
        }
    }, 
    
    [initialProduct]);
        useEffect(() => {
        return () => {
            if (formData.imagen && formData.imagen.startsWith('blob:')) {
                URL.revokeObjectURL(formData.imagen);
            }
        };
    }, [formData.imagen]);


    const handleSubmit = useCallback(async (event: React.FormEvent) => {
        event.preventDefault();
        
        if (isLoading) return; // Evitar múltiples submits
        
        setIsLoading(true);

        const confirmMessage = mode === 'create' 
            ? '¿Estás seguro de que quieres crear este producto?'
            : '¿Estás seguro de que quieres modificar este producto?';

        if (window.confirm(confirmMessage)) {
            try {
                if (selectedFile) {
                    showToast("Subiendo imagen...", "info");
                    //console.log('Archivo seleccionado para subir:', selectedFile);
                    // TODO: Aquí irá la lógica de subida de imagen
                }

                if (mode === 'create') {
                    // Crear nuevo producto
                    const newProduct: Product = {
                        id: Date.now(), // En producción vendría del servidor
                        titulo: formData.titulo,
                        costo: formData.costo,
                        descripcion: formData.descripcion,
                        imagen: formData.imagen
                    };
                    
                    //console.log('Crear nuevo producto:', newProduct);
                    onSave?.(newProduct);
                    showToast("Producto creado exitosamente", "success");
                    
                    // Limpiar formulario después de crear
                    setFormData({
                        titulo: '',
                        costo: 0,
                        descripcion: '',
                        imagen: '/placeholder.jpg'
                    });
                    setSelectedFile(null);
                    
                } else {
                    // Editar producto existente
                    const updatedProduct: Product = {
                        id: initialProduct!.id,
                        titulo: formData.titulo,
                        costo: formData.costo,
                        descripcion: formData.descripcion,
                        imagen: formData.imagen
                    };
                    
                    //console.log('Actualizar producto:', updatedProduct);
                    onSave?.(updatedProduct);
                    showToast("Producto actualizado exitosamente", "success");
                }

            } catch (error) {
                //console.error('Error al guardar:', error);
                showToast(`Error al ${mode === 'create' ? 'crear' : 'actualizar'} el producto`, "error");
            } finally {
                setIsLoading(false);
            }
        } else {
            setIsLoading(false); // Reset si cancela
        }
    }, [formData, mode, onSave, initialProduct, selectedFile, showToast, isLoading]);
    
    
    // Manejar eliminación
    const handleDelete = useCallback(async () => {
        if (!initialProduct || mode === 'create') return;
        
        if (isLoading) return; // Evitar múltiples clicks
        
        if (window.confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.')) {
            setIsLoading(true);
            try {
                //console.log('Eliminar producto con ID:', initialProduct.id);
                onDelete?.(initialProduct.id);
                showToast("Producto eliminado exitosamente", "success");
                
            } catch (error) {
                //console.error('Error al eliminar:', error);
                showToast("Error al eliminar el producto", "error");
            } finally {
                setIsLoading(false);
            }
        }
    }, [initialProduct, mode, onDelete, showToast, isLoading]);

    // Manejar cambios en inputs
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'costo' ? Number(value) : value
        }));
    }, []);

    
    const handleImageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            showToast('Por favor selecciona un archivo de imagen válido', "error");
            return;
        }

        // Validar tamaño de archivo (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            showToast('El archivo es muy grande. Máximo 5MB', "error");
            return;
        }

        // Limpiar URL anterior si existe
        if (formData.imagen && formData.imagen.startsWith('blob:')) {
            URL.revokeObjectURL(formData.imagen);
        }

        setSelectedFile(file);
        // Vista previa de la imagen seleccionada
        const previewImage = URL.createObjectURL(file);
        setFormData(prev => ({ ...prev, imagen: previewImage }));
        
        showToast('Imagen seleccionada correctamente', "success");
    }, [formData.imagen, showToast]);

    
    return {
        // Estados
        formData,
        selectedFile,
        isLoading,
        toast,
        
        // Funciones
        handleSubmit,
        handleDelete,
        handleChange,
        handleImageChange,
        hideToast
    };

};

