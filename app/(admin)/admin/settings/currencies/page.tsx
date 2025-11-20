import { getAllCurrencies } from '@/lib/api/currencies';
import CurrencySettingsClient from './CurrencySettingsClient';

export default async function CurrenciesPage() {
  const { data, error } = await getAllCurrencies();

  const currencies = Array.isArray(data) ? data : [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <h1 className="text-2xl font-semibold mb-6">Panel de Monedas</h1>
      <CurrencySettingsClient initialCurrencies={currencies} />
    </div>
  );
}
