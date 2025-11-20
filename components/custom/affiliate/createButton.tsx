"use client"
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export const CreateButton = () => {
    const router = useRouter();
    
    return (
        <Button 
            onClick={() => router.push('/affiliate/products/create')} 
            className="bg-green-500 hover:bg-green-700"
        >
            Agregar Producto
        </Button>
    );
};