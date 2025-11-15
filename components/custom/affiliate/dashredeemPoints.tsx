"use client"

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

interface Product {
  name: string;
  ecoColones: number;
}

interface PointsExchangeCardsProps {
  monthlyTotal: number;
  exchangeRate: number;
}

export const PointsExchangeCards: React.FC<PointsExchangeCardsProps> = ({ 
  monthlyTotal, 
  exchangeRate 
}) => {
  const [code, setCode] = useState("");
  const [redeemedProducts, setRedeemedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProcessCode = async (form: React.FormEvent) => {
    form.preventDefault();
    
    if (!code.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // TODO: Aquí irá el fetch al API route
      // Simulación por ahora:
      
      // Simular productos
      const mockProducts: Product[] = [
        { name: "Café Orgánico", ecoColones: 500 },
        { name: "Bolsa Reutilizable", ecoColones: 300 },
        { name: "Bolsa Reutilizable", ecoColones: 300 },

      ];
      
      setRedeemedProducts(mockProducts);
      setCode("");
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el código');
    } finally {
      setIsLoading(false);
    }
  };

  const totalRedeemed = redeemedProducts.reduce((sum, product) => sum + product.ecoColones, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Card 1: Procesar EcoColones */}
      <Card className="p-6 bg-white shadow-md rounded-lg border border-gray-300">
        <h3 className="text-xl font-semibold mb-4">Procesar EcoColones</h3>
        <form  onSubmit={handleProcessCode} className="space-y-4">
          <Input
            type="text"
            placeholder="Ingrese el código de canje"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full"
            disabled={isLoading}
          />
          {error && (
            <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>
          )}
          <Button 
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            disabled={!code.trim() || isLoading}
          >
            {isLoading ? 'Procesando...' : 'Procesar Código'}
          </Button>
        </form>
      </Card>

      {/* Card 2: Lista de Productos */}
      <Card className="p-6 bg-white shadow-md rounded-lg border bg-green-100 border-gray-300">
        <h3 className="text-xl font-semibold mb-2">Lista de Productos</h3>
        <hr className="mb-4 border-gray-300" />
        
        {redeemedProducts.length > 0 ? (
          <div className="space-y-4">
            <div className="max-h-50 overflow-y-auto bg-green-100">
              <Table>
                <TableBody>
                  {redeemedProducts.map((product, index) => (
                    <TableRow key={index} className="bg-green-100 hover:bg-green-100">
                      <TableCell className="text-left text-gray-700">
                        {product.name}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-700">
                        {product.ecoColones} EC
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center pt-3 border-t-2 border-gray-400">
              <span className="font-bold text-lg">Monto total:</span>
              <span className="font-bold text-lg text-green-700">{totalRedeemed} EC</span>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No hay productos canjeados</p>
        )}
      </Card>

      {/* Card 3: Información */}
      <Card className="p-6 bg-white shadow-md rounded-lg border border-gray-300">
        <h3 className="text-xl font-semibold mb-4">Resumen del Mes</h3>
        <div className="space-y-6">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-gray-600 mb-1">Total EcoColones Canjeados</p>
            <p className="text-3xl font-bold text-green-700">{monthlyTotal.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Este mes</p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Tipo de Cambio Actual</p>
            <p className="text-2xl font-bold text-blue-700">
              1 EC = ₡{exchangeRate.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Colones Costarricenses</p>
          </div>
        </div>
      </Card>
    </div>
  );
};