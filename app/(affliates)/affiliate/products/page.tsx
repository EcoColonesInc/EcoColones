import { mockProducts, mockaffiliate } from "@/app/mockups/mockups";
import { ProductSearch } from "@/components/custom/affiliate/searchProduct";

export default function products() {



//TODO: Hay que configurar los botones de editar producto para que funcionen correctamente

return (
  <div className="container mx-auto px-4 space-y-12 md:space-y-20">
      <h1 className="text-3xl font-bold mb-4 pt-10">{mockaffiliate.name}</h1>
      <h2 className=" text-lg text-gray-600 mb-5">{mockaffiliate.direccion}</h2>
      <div className="container mx-auto min-h-96 bg-green-50 border rounded-lg p-6 shadow-md mb-5" >
          <h3 className="text-xl font-semibold mb-4">Productos registrados</h3>

          <ProductSearch products={mockProducts} />
      </div>
  </div>
);
}