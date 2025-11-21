import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';

interface Product {
    id: string;
    relId?: string;
    imagen: string;
    titulo: string;
    descripcion: string;
    costo: number;
}

interface UseProductFormProps {
    initialProduct?: Product;           // Producto a editar (opcional)
    mode: 'create' | 'edit';           // Modo del formulario
    businessId?: string;                // ID del negocio afiliado para crear productos
    onSave?: (product: Product) => void;    // Callback cuando guarda
    onDelete?: (productId: string) => void; // Callback cuando elimina
}

export const useProductForm = ({ initialProduct, mode, businessId, onSave, onDelete }: UseProductFormProps) => {
    const router = useRouter();

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
                    // Crear nuevo producto en la base de datos
                    if (!businessId) {
                        showToast("Error: No se encontró el ID del negocio", "error");
                        setIsLoading(false);
                        return;
                    }

                    // 1. Create the product in the product table
                    const productResponse = await fetch('/api/products/post', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            product_name: formData.titulo,
                            description: formData.descripcion,
                            state: 'active',
                        }),
                    });

                    if (!productResponse.ok) {
                        const errorData = await productResponse.json();
                        throw new Error(errorData.error || 'Error al crear el producto');
                    }

                    const productResult = await productResponse.json();
                    const newProductId = productResult?.data?.product_id || productResult?.data?.[0]?.product_id;

                    if (!newProductId) {
                        throw new Error('No se pudo obtener el ID del producto creado');
                    }

                    // 2. Upload image to Supabase Storage if file is selected
                    if (selectedFile) {
                        showToast("Subiendo imagen...", "info");
                        
                        // Get file extension
                        const fileExt = selectedFile.name.split('.').pop()?.toLowerCase() || 'png';
                        const fileName = `${newProductId}.${fileExt}`;
                        
                        // Import Supabase client
                        const { createClient } = await import('@/utils/supabase/client');
                        const supabase = createClient();
                        
                        // Upload to product_logo bucket
                        const { error: uploadError } = await supabase.storage
                            .from('product_logo')
                            .upload(fileName, selectedFile, {
                                cacheControl: '3600',
                                upsert: true, // Replace if exists
                            });
                        
                        if (uploadError) {
                            console.error('Error uploading image:', uploadError);
                            showToast("Advertencia: Producto creado pero la imagen no se pudo subir", "info");
                        }
                    }

                    // 3. Get business name for the relationship
                    const businessResponse = await fetch(`/api/affiliatedbusiness/${businessId}/get`);
                    if (!businessResponse.ok) {
                        throw new Error('Error al obtener información del negocio');
                    }
                    const businessData = await businessResponse.json();
                    const businessName = businessData?.data?.affiliated_business_name || businessData?.affiliated_business_name;

                    if (!businessName) {
                        throw new Error('No se pudo obtener el nombre del negocio');
                    }

                    // 4. Create the relationship in affiliatedbusinessxproduct table
                    const relationResponse = await fetch('/api/affiliatedbusinessxproduct/post', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            product_name: formData.titulo,
                            affiliated_business_name: businessName,
                            product_price: formData.costo,
                        }),
                    });

                    if (!relationResponse.ok) {
                        const errorData = await relationResponse.json();
                        throw new Error(errorData.error || 'Error al crear la relación del producto');
                    }

                    const newProduct: Product = {
                        id: newProductId,
                        titulo: formData.titulo,
                        costo: formData.costo,
                        descripcion: formData.descripcion,
                        imagen: formData.imagen
                    };
                    
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

                    // Redirigir después de 1.5 segundos
                    setTimeout(() => {
                        router.push('/affiliate/products');
                        router.refresh();
                    }, 1500);
                    
                } else {
                    // Editar producto existente - actualizar en la base de datos
                    if (!initialProduct?.relId || !initialProduct?.id) {
                        showToast("Error: No se encontró el ID del producto", "error");
                        setIsLoading(false);
                        return;
                    }

                    // 1. Actualizar los detalles del producto (nombre, descripción)
                    const productResponse = await fetch(`/api/products/${initialProduct.id}/patch`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            product_name: formData.titulo,
                            description: formData.descripcion,
                        }),
                    });

                    if (!productResponse.ok) {
                        const errorData = await productResponse.json();
                        throw new Error(errorData.error || 'Error al actualizar los detalles del producto');
                    }

                    // 2. Actualizar el precio en la relación negocio-producto
                    const priceResponse = await fetch(`/api/affiliatedbusinessxproduct/${initialProduct.relId}/patch`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            product_price: formData.costo,
                        }),
                    });

                    if (!priceResponse.ok) {
                        const errorData = await priceResponse.json();
                        throw new Error(errorData.error || 'Error al actualizar el precio del producto');
                    }

                    const updatedProduct: Product = {
                        id: initialProduct.id,
                        relId: initialProduct.relId,
                        titulo: formData.titulo,
                        costo: formData.costo,
                        descripcion: formData.descripcion,
                        imagen: formData.imagen
                    };
                    
                    onSave?.(updatedProduct);
                    showToast("Cambios guardados exitosamente", "success");
                    
                    // Redirigir después de 1.5 segundos
                    setTimeout(() => {
                        router.push('/affiliate/products');
                        router.refresh();
                    }, 1500);
                }

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
                showToast(`Error al ${mode === 'create' ? 'crear' : 'actualizar'} el producto: ${errorMessage}`, "error");
            } finally {
                setIsLoading(false);
            }
        } else {
            setIsLoading(false); // Reset si cancela
        }
    }, [formData, mode, onSave, initialProduct, selectedFile, showToast, isLoading, router]);
    
    
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
                
            } catch {
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

