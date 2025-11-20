export type Currency = {
  currency_id: string;
  currency_name: string;
  currency_exchange: number; // colones por 1 unidad de la moneda
};

// Convierte un monto desde la moneda con tasa fromExchange (colones por unidad)
// hacia la moneda con tasa toExchange (colones por unidad)
export function convertCurrency(amount: number, fromExchange: number, toExchange: number) {
  if (!isFinite(amount) || !isFinite(fromExchange) || !isFinite(toExchange) || toExchange === 0) return 0;
  return amount * (fromExchange / toExchange);
}

export function toColones(amount: number, fromExchange: number) {
  if (!isFinite(amount) || !isFinite(fromExchange)) return 0;
  return amount * fromExchange;
}

export function fromColones(amountColones: number, toExchange: number) {
  if (!isFinite(amountColones) || !isFinite(toExchange) || toExchange === 0) return 0;
  return amountColones / toExchange;
}
