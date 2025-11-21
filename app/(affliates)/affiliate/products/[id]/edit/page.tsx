import { ProductForm } from "@/components/custom/affiliate/productForm";
import { getProductsByAffiliatedBusinessId } from "@/lib/api/products";
import { getUserAffiliatedBusiness } from "@/lib/api/affiliatedbusiness";

interface ProductRelation {
  affiliated_business_x_prod: string;
  product_id: {
    product_id: string;
    product_name: string;
    description?: string | null;
    image_url?: string;
  };
  affiliated_business_id: {
    affiliated_business_id: string;
    affiliated_business_name: string;
  };
  product_price: number;
}

interface RawProductRelation {
  affiliated_business_x_prod?: string;
  product_id?: {
    product_id?: string;
    product_name?: string;
    description?: string | null;
    image_url?: string;
  };
  affiliated_business_id?: {
    affiliated_business_id?: string;
    affiliated_business_name?: string;
  };
  product_price?: number | string | null;
}

export const dynamic = 'force-dynamic';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: relId } = await params;
  
  // Get the current user's affiliated business
  const { data: businessData, error: businessError } = await getUserAffiliatedBusiness();
  
  if (businessError || !businessData) {
    return (
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-red-600">Error</h1>
        <p className="text-red-600 mt-4">
          {businessError || "No se encontró un negocio afiliado para este usuario."}
        </p>
      </div>
    );
  }

  const businessId = businessData.affiliated_business_id;
  const businessName = businessData.affiliated_business_name || "Mi Comercio";

  // Get all products for this business
  const productsRes = await getProductsByAffiliatedBusinessId(businessId);
  const raw = (productsRes.data ?? []) as unknown[];
  const rawRelations = raw as RawProductRelation[];
  
  const allRelations: ProductRelation[] = rawRelations.map((r) => ({
    affiliated_business_x_prod: r.affiliated_business_x_prod || "",
    product_id: {
      product_id: r.product_id?.product_id || "",
      product_name: r.product_id?.product_name || "",
      description: r.product_id?.description ?? null,
      image_url: r.product_id?.image_url || "",
    },
    affiliated_business_id: {
      affiliated_business_id:
        r.affiliated_business_id?.affiliated_business_id || "",
      affiliated_business_name:
        r.affiliated_business_id?.affiliated_business_name || "",
    },
    product_price: Number(r.product_price ?? 0),
  }));

  // Find the specific product relation by the relation ID (or product ID as fallback)
  let relation = allRelations.find((r) => r.affiliated_business_x_prod === relId) || null;
  if (!relation) {
    relation = allRelations.find((r) => r.product_id?.product_id === relId) || null;
  }

  if (!relation) {
    return (
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-red-600">Producto no encontrado</h1>
        <p className="text-gray-600 mt-4">
          El producto que intentas editar no existe o no tienes permisos para acceder a él.
        </p>
      </div>
    );
  }

  // Transform to the format expected by ProductForm
  const currentProduct = {
    id: relation.product_id.product_id,
    relId: relation.affiliated_business_x_prod,
    imagen: relation.product_id.image_url || '/productos/placeholder.png',
    titulo: relation.product_id.product_name,
    descripcion: relation.product_id.description || '',
    costo: relation.product_price,
  };

  return (
    <div className="container mx-auto px-4 space-y-12 md:space-y-20">
      <div>
        <h1 className="text-3xl font-bold mb-4 pt-10">Editar Producto</h1>
        <h2 className="text-lg text-gray-600 mb-5">{businessName}</h2>
        <ProductForm 
          product={currentProduct} 
          mode="edit"
        />
      </div>
    </div>
  );
}