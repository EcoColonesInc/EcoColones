export type ProductData = {
    affiliated_business_x_prod: string;
    product_id: { 
        product_id: string;
        product_name: string;
        description: string;
        state: string;
    };
    affiliated_business_id: { 
        affiliated_business_id: string;
        affiliated_business_name: string;
        description: string;
    };
    product_price: number;
}

export type Product = {
    id: string;
    imagen: string;
    titulo: string;
    descripcion: string;
    costo: number;
};