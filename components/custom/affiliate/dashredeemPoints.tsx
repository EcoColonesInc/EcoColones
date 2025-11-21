"use client"

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

interface Product {
  name: string;
  amount: number;
}

interface TransactionDetails {
  ab_transaction_id: string;
  transaction_code: string;
  person_name: string;
  user_name: string;
  products: Product[];
  total_price: number;
  currency_name: string;
  state: string;
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
  const [previewTransaction, setPreviewTransaction] = useState<TransactionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleCheckTransaction = async () => {
    if (!code.trim()) return;

    setIsChecking(true);
    setError(null);
    setPreviewTransaction(null);

    try {
      const response = await fetch('/api/affiliatedbusinesstransactions/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transaction_code: code.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al verificar la transacción');
      }

      setPreviewTransaction(data.transaction);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al verificar la transacción');
    } finally {
      setIsChecking(false);
    }
  };

  const handleProcessCode = async (form: React.FormEvent) => {
    form.preventDefault();
    
    if (!code.trim()) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/affiliatedbusinesstransactions/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transaction_code: code.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar el código');
      }

      const transaction: TransactionDetails = data.transaction;
      
      // Agregar productos de la transacción a la lista
      const newProducts = transaction.products.map(product => ({
        name: product.name,
        amount: product.amount
      }));
      
      setRedeemedProducts(prev => [...prev, ...newProducts]);
      setSuccessMessage(`¡Canje exitoso! Transacción ${transaction.transaction_code} completada para ${transaction.person_name}`);
      setCode("");
      setPreviewTransaction(null);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el código');
    } finally {
      setIsLoading(false);
    }
  };

  const totalRedeemed = redeemedProducts.reduce((sum, product) => sum + product.amount, 0);

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
            disabled={isLoading || isChecking}
          />
          {error && (
            <p className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-300">{error}</p>
          )}
          {successMessage && (
            <p className="text-green-600 text-sm bg-green-50 p-2 rounded border border-green-300">{successMessage}</p>
          )}
          
          {/* Preview de la transacción */}
          {previewTransaction && (
            <div className="bg-blue-50 border border-blue-300 rounded p-3 space-y-2">
              <p className="font-semibold text-blue-900">Vista previa:</p>
              <p className="text-sm"><span className="font-medium">Cliente:</span> {previewTransaction.person_name}</p>
              <p className="text-sm"><span className="font-medium">Usuario:</span> {previewTransaction.user_name}</p>
              <p className="text-sm"><span className="font-medium">Total:</span> {previewTransaction.total_price.toLocaleString()} {previewTransaction.currency_name}</p>
              <div className="text-sm">
                <span className="font-medium">Productos:</span>
                <ul className="ml-4 mt-1">
                  {previewTransaction.products.map((p, idx) => (
                    <li key={idx}>• {p.name} (x{p.amount})</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              type="button"
              onClick={handleCheckTransaction}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!code.trim() || isLoading || isChecking}
            >
              {isChecking ? 'Verificando...' : 'Verificar'}
            </Button>
            <Button 
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              disabled={!code.trim() || isLoading || isChecking}
            >
              {isLoading ? 'Procesando...' : 'Completar'}
            </Button>
          </div>
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
                        <div className="font-medium">{product.name}</div>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-700">
                        x{product.amount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center pt-3 border-t-2 border-gray-400">
              <span className="font-bold text-lg">Total productos:</span>
              <span className="font-bold text-lg text-green-700">{totalRedeemed}</span>
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