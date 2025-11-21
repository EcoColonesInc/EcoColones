"use client";

import React, { useMemo, useState } from 'react';
import { Currency, convertCurrency } from '@/lib/utils/currency';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
  initialCurrencies: Currency[];
};

const flagFor = (code: string) => {
  const map: Record<string, string> = {
    USD: '🇺🇸',
    CRC: '🇨🇷',
    EUR: '🇪🇺',
    GBP: '🇬🇧',
    JPY: '🇯🇵',
    CAD: '🇨🇦',
    AUD: '🇦🇺',
    CHF: '🇨🇭',
    CNY: '🇨🇳',
    INR: '🇮🇳',
    MXN: '🇲🇽',
    CLP: '🇨🇱',
    PEN: '🇵🇪',
  };
  return map[code] ?? code;
};

export default function CurrencySettingsClient({ initialCurrencies }: Props) {
  const [amount, setAmount] = useState<number>(1000);
  const [baseCurrency, setBaseCurrency] = useState<string>(() => initialCurrencies[0]?.currency_name ?? 'CRC');
  

  const currencies = useMemo(() => initialCurrencies, [initialCurrencies]);
  const base = currencies.find((c) => c.currency_name === baseCurrency) ?? ({ currency_exchange: 1 } as Currency);

  return (
    <div className="space-y-8 w-full">
      {/* Main header card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <CardTitle>Panel de Monedas Internacionales</CardTitle>
              <CardDescription>Conversión y análisis de divisas en tiempo real</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Conversor (grande) */}
            <div className="lg:col-span-2 bg-white rounded-lg border p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold">Conversor de Monedas</div>
                  <div className="text-xs text-muted-foreground">Calcula conversiones instantáneas</div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-green-600 text-xl">¢</span>
                    <Input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-40" />
                  </div>

                  <div className="w-56">
                    <Label className="text-xs">Moneda Base</Label>
                    <select value={baseCurrency} onChange={(e) => setBaseCurrency(e.target.value)} className="w-full border rounded px-3 py-2">
                      {currencies.map((c) => (
                        <option key={c.currency_id} value={c.currency_name}>{flagFor(c.currency_name)} {c.currency_name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="bg-[#ECF9F1] rounded-lg border p-6">
              <div className="text-sm font-medium mb-2">Estadísticas</div>
              <div className="space-y-3">
                <div className="bg-white rounded p-3">Monedas Seguidas<div className="text-lg font-semibold mt-1">{currencies.length}</div></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversiones grid */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Conversiones</h3>
        <div className="border rounded-lg p-4 bg-transparent">
          {/* Fixed-height scrollable area showing 9 items (3 rows x 3 cols) */}
          <div className="max-h-[520px] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currencies.map((c) => {
                const converted = convertCurrency(amount, base.currency_exchange, c.currency_exchange);
                return (
                  <div key={c.currency_id} className="border rounded-lg p-6 bg-white shadow-sm flex flex-col justify-between h-36">
                    <div>
                      <div className="text-sm font-semibold text-green-700">{c.currency_name}</div>
                      <div className="text-2xl font-bold text-green-600 mt-1">{Number(converted.toFixed(2))}</div>
                      <div className="text-xs text-muted-foreground mt-1">{c.currency_name}</div>
                    </div>
                    <div className="self-end text-3xl">{flagFor(c.currency_name)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
