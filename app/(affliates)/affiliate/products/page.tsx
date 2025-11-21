import { ProductSearch } from "@/components/custom/affiliate/searchProduct";
import { CreateButton } from "@/components/custom/affiliate/createButton";
import { Product, ProductData } from "@/types/product";
import { createClient } from "@/utils/supabase/server"; // Cambiado de client a server
import { getUserAffiliatedBusiness } from "@/lib/api/affiliatedbusiness";
import { getProductsByAffiliatedBusinessId } from "@/lib/api/products";

export default async function products() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    let affiliatedBusinessId: string | null = null;
    let businessName: string = "Mi Comercio";
    let businessAddress: string = "";
    let businessError: string | null = null;
    let productsError: string | null = null;

    if (error || !data.user) {
        businessError = error?.message || "Usuario no autenticado. Por favor, inicia sesión."; // Cambiado authError a error
    } else {
        // Obtener el negocio afiliado del usuario
        const { data: businessData, error: businessFetchError } = await getUserAffiliatedBusiness();

        if (businessFetchError) {
            businessError = `Error al buscar negocio: ${businessFetchError}`;
        } else if (businessData) {
            affiliatedBusinessId = businessData.affiliated_business_id;
            businessName = businessData.affiliated_business_name || "Mi Comercio";
            // Construir la dirección
            const district = businessData.district_id?.[0]?.district_name || "";
            businessAddress = district ? `Ubicado en ${district}` : "";
        } else {
            businessError = "No se encontró un negocio afiliado para este usuario.";
        }
    }

    // --- OBTENER PRODUCTOS ---
    let transformedProducts: Product[] = [];

    if (affiliatedBusinessId) {
        const { data: productsData, error: productsFetchError } = await getProductsByAffiliatedBusinessId(affiliatedBusinessId);
        console.log("Productos obtenidos:", productsData);

        if (productsFetchError) {
            productsError = `Error al obtener productos: ${productsFetchError}`;
        } else if (productsData) {
            const businessProducts = productsData as unknown as any[];
            transformedProducts = businessProducts.map(item => {
                // The product_id object contains product_id_1 as the actual ID
                const actualProductId = item.product_id?.product_id_1 || item.product_id?.product_id || '';
                return {
                    id: item.affiliated_business_x_prod, // Use the relation ID for editing
                    productId: actualProductId, // Add the actual product ID for state updates
                    imagen: item.product_id?.image_url || '',
                    titulo: item.product_id?.product_name || '',
                    descripcion: item.product_id?.description || '',
                    costo: item.product_price || 0,
                    state: item.product_id?.state === 'active', // Convert string 'active' to boolean
                };
            });
        }
    }

    return (
        <div className="container mx-auto px-4 space-y-12 md:space-y-20">
            <h1 className="text-3xl font-bold mb-4 pt-10">{businessName}</h1>
            <h2 className="text-lg text-gray-600 mb-5">{businessAddress}</h2>

            {/* Mensaje de error general */}
            {businessError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-600 font-semibold">Error:</p>
                    <p className="text-red-700">{businessError}</p>
                </div>
            )}

            <div className="container mx-auto min-h-96 bg-green-50 border rounded-lg p-6 shadow-md mb-5">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold mb-4">Productos registrados</h3>
                    <CreateButton />
                </div>

                {productsError ? (
                    <div className="text-red-600 border border-red-300 p-4 rounded bg-red-50">
                        {productsError}
                    </div>
                ) : transformedProducts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p className="text-lg">No hay productos registrados</p>
                        <p className="text-sm">Comienza agregando tu primer producto</p>
                    </div>
                ) : (
                    <ProductSearch products={transformedProducts} />
                )}
            </div>
        </div>
    );
}