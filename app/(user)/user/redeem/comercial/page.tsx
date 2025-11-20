"use client";

import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

interface Product {
  id?: string | number;
  name: string;
  description?: string;
  price?: number;
  image?: string;
}

function StoreInner() {
  const search = useSearchParams();
  const router = useRouter();
  const businessId = search.get("id");

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [showModal, setShowModal] = useState(false);
  const [storeName, setStoreName] = useState<string>("Comercio");
  const { user: authUser } = useAuth();
  const [userPoints, setUserPoints] = useState<number | null>(null);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!businessId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/affiliatedbusinessxproduct/${businessId}/get`);
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error ?? "Error fetching products");

        const rows = Array.isArray(body) ? body : (body?.data ?? []);

        const mapped = await Promise.all((rows || []).map(async (r: unknown, idx: number) => {
          const row = (r && typeof r === 'object') ? (r as Record<string, unknown>) : {};
          const productIdField = row['product_id'];
          const id = (productIdField && typeof productIdField === 'object') ? ((productIdField as Record<string, unknown>)['product_id'] as string | number) ?? ((productIdField as Record<string, unknown>)['product_id'] as string | number) : (row['product_id'] as string | number) ?? idx;
          const name = ((productIdField && typeof productIdField === 'object') ? ((productIdField as Record<string, unknown>)['product_name'] as string | undefined) : undefined) ?? (row['product_name'] as string) ?? `Producto ${idx + 1}`;
          const description = ((productIdField && typeof productIdField === 'object') ? ((productIdField as Record<string, unknown>)['description'] as string | undefined) : undefined) ?? (row['description'] as string) ?? "";
          const price = Number(row['product_price'] ?? row['product_price'] ?? 0) || 0;
          
          // Get image from Supabase storage using product_id
          // Try multiple extensions since we don't know which one is used
          let image = 'placeholder.png';
          if (id) {
            const extensions = ['png', 'jpg', 'jpeg', 'webp'];
            for (const ext of extensions) {
              const path = `${id}.${ext}`;
              const { data } = supabase.storage.from("product_logo").getPublicUrl(path);
              if (data?.publicUrl) {
                // Check if the file actually exists by trying to fetch it
                try {
                  const response = await fetch(data.publicUrl, { method: 'HEAD' });
                  if (response.ok) {
                    image = data.publicUrl;
                    break;
                  }
                } catch {
                  // Continue to next extension
                }
              }
            }
          }
          
          return { id, name, description, price, image };
        }));

        // try to set store name from the first row if available
        if (rows && rows.length > 0) {
          const first = rows[0];
          const name = first.affiliated_business_id?.affiliated_business_name ?? first.affiliated_business_name ?? null;
          if (name && mounted) setStoreName(name);
        }

        if (mounted) setProducts(mapped);
      } catch (err) {
        console.error("Error loading products for business:", err);
        if (mounted) setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [businessId]);

  // Load user points from API
  useEffect(() => {
    let mounted = true;
    if (!authUser?.id) return;
    (async () => {
      try {
        const res = await fetch(`/api/persons/${authUser.id}/points/get`);
        const body = await res.json();

        // Normalize response shapes and try to extract a numeric points value
        let pts: number | null = null;
        if (body == null) pts = null;
        else if (typeof body === "number") pts = body;
        else if (Array.isArray(body)) {
          if (body.length === 0) pts = 0;
          else {
            const first = body[0] ?? {};
            pts = Number(
              first.point_amount ??
              first.points ??
              first.total_points ??
              first.accumulated_points ??
              first.points_available ??
              null
            ) || 0;
          }
        } else if (typeof body === "object") {
          pts = Number(
            body.point_amount ??
            body.points ??
            body.total_points ??
            body.accumulated_points ??
            (body.data && (
              body.data.point_amount ??
              body.data.points ??
              body.data[0]?.point_amount ??
              body.data[0]?.points
            )) ??
            null
          ) || 0;
        }

        if (mounted && pts !== null) setUserPoints(pts);
      } catch (err) {
        console.error("Error fetching user points:", err);
      }
    })();
    return () => { mounted = false; };
  }, [authUser?.id]);

  const total = Object.entries(cart).reduce((acc, [name, qty]) => {
    const product = products.find((p) => p.name === name);
    return acc + (product?.price ?? 0) * qty;
  }, 0);

  const updateQty = (name: string, qty: number) => {
    setCart((prev) => ({
      ...prev,
      [name]: Math.max(0, qty),
    }));
  };

  const [insufficientMsg, setInsufficientMsg] = useState<string | null>(null);
  const [processingPurchase, setProcessingPurchase] = useState(false);

  const handleBuyClick = () => {
    if (total <= 0) {
      setInsufficientMsg("Agrega productos al carrito");
      window.setTimeout(() => setInsufficientMsg(null), 4000);
      return;
    }

    if (total <= displayPoints) {
      setInsufficientMsg(null);
      setShowModal(true);
    } else {
      setInsufficientMsg("No tienes puntos suficientes");
      window.setTimeout(() => setInsufficientMsg(null), 4000);
    }
  };

  const performPurchase = async () => {
    if (!authUser?.id) {
      setInsufficientMsg("Usuario no autenticado");
      window.setTimeout(() => setInsufficientMsg(null), 4000);
      return;
    }

    setProcessingPurchase(true);
    try {
      // 1) Get the latest user points from API
      const ptsRes = await fetch(`/api/persons/${authUser.id}/points/get`);
      const ptsBody = await ptsRes.json();

      // normalize response to a numeric points value
      let pts: number | null = null;
      if (ptsBody == null) pts = null;
      else if (typeof ptsBody === "number") pts = ptsBody;
      else if (Array.isArray(ptsBody)) {
        if (ptsBody.length === 0) pts = 0;
        else {
          const first = ptsBody[0] ?? {};
          pts = Number(first.point_amount ?? first.points ?? first.total_points ?? first.accumulated_points ?? first.points_available ?? null) || 0;
        }
      } else if (typeof ptsBody === "object") {
        pts = Number(
          ptsBody.point_amount ??
          ptsBody.points ??
          ptsBody.total_points ??
          ptsBody.accumulated_points ??
          (ptsBody.data && (
            ptsBody.data.point_amount ??
            ptsBody.data.points ??
            ptsBody.data[0]?.point_amount ??
            ptsBody.data[0]?.points
          )) ??
          null
        ) || 0;
      }

      if (pts === null) {
        throw new Error('No se pudo obtener los puntos del usuario');
      }

      if (pts < total) {
        setInsufficientMsg('No tienes puntos suficientes');
        window.setTimeout(() => setInsufficientMsg(null), 4000);
        return;
      }

      const newPoints = Math.max(0, Math.floor(pts - total));

      // 2) Patch the user's points
      const patchRes = await fetch(`/api/points/${authUser.id}/patch`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ point_amount: newPoints }),
      });
      const patchBody = await patchRes.json();
      if (!patchRes.ok) {
        throw new Error(patchBody?.error ?? 'Error actualizando puntos');
      }

      // 3) Get person full name
      const personRes = await fetch(`/api/persons/${authUser.id}/get`);
      const personBody = await personRes.json();
      const personObj = Array.isArray(personBody) ? personBody[0] : (personBody?.data ?? personBody);
      const firstName = personObj?.first_name ?? personObj?.firstName ?? '';
      const lastName = personObj?.last_name ?? personObj?.lastName ?? '';
      const secondLast = personObj?.second_last_name ?? personObj?.secondLastName ?? '';
      const personName = `${(firstName || '').trim()} ${(lastName || '').trim()}${secondLast ? ' ' + (secondLast || '').trim() : ''}`.trim();

      // 4) Get default currency
      const curRes = await fetch('/api/parameters/get');
      const curBody = await curRes.json();
      const cur = Array.isArray(curBody) ? curBody[0] : curBody;
      const currencyName = cur?.name ?? cur?.parameter ?? cur?.currency_name ?? cur?.currency ?? 'CRC';

      // 5) Create a single transaction for all items in the cart
      // Build items payload: prefer product_id when available, include product_price to avoid extra lookups
      const entries = Object.entries(cart).filter(([, qty]) => qty > 0);
      if (entries.length === 0) {
        throw new Error('No hay ítems en el carrito para procesar');
      }

      const itemsPayload = entries.map(([prodName, qty]) => {
        const prod = products.find((p) => p.name === prodName);
        return {
          product_id: prod?.id ?? undefined,
          product_name: prod?.name ?? prodName,
          product_amount: qty,
          product_price: prod?.price ?? 0,
        };
      });

      // Generate a client-side transaction code (server will check uniqueness)
      const prefix = (storeName && typeof storeName === 'string')
        ? storeName.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase()
        : 'ECO';
      const timePart = String(Date.now()).slice(-10);
      const transactionCode = `${prefix}${timePart}${Math.random().toString(36).slice(2,6)}`;

      const txRes = await fetch('/api/affiliatedbusinesstransactions/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person_name: personName,
          affiliated_business_name: storeName,
          currency_name: currencyName,
          items: itemsPayload,
          transaction_code: transactionCode,
        }),
      });

      const txBody = await txRes.json();
      if (!txRes.ok) {
        throw new Error(txBody?.error ?? 'Error creando transacción');
      }

      // Expect response shape: { message, data: { transaction, items } }
      const createdTransaction = txBody?.data?.transaction ?? txBody?.data ?? null;
      const generatedCode = createdTransaction?.transaction_code ?? createdTransaction?.transactionCode ?? null;

      // Optionally show transaction code to user
      if (generatedCode) {
        alert(`Compra realizada con éxito. Código de transacción: ${generatedCode}`);
      } else {
        alert('Compra realizada con éxito.');
      }

      // 6) Success — clear cart, update local points and close modal
      setCart({});
      setUserPoints(newPoints);
      setShowModal(false);
      alert('Compra realizada con éxito. Puedes verificar el codigo de transaccion en tu historial de compras.');
    } catch (err: unknown) {
      console.error('Purchase error:', err);
      if (err instanceof Error) {
        setInsufficientMsg(err.message);
        window.setTimeout(() => setInsufficientMsg(null), 6000);
      } else {
        setInsufficientMsg('Error realizando la compra');
        window.setTimeout(() => setInsufficientMsg(null), 6000);
      }
    } finally {
      setProcessingPurchase(false);
    }
  };

  const handleConfirm = async () => {
    await performPurchase();
  };

  const displayPoints = userPoints ?? 0;

  return (
    <div className="min-h-screen bg-white px-6 md:px-16 py-10 flex gap-12">
      {/* LEFT SIDE CONTENT */}
      <div className="flex-1">
        {/* Store Header */}
        <button onClick={() => router.back()} className="text-2xl mb-2 cursor-pointer">
          ←
        </button>
        <h1 className="text-4xl font-bold">{storeName}</h1>
        <p className="text-gray-600 mb-10">Detalle del comercio</p>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {loading && <p className="text-sm text-gray-500">Cargando productos...</p>}
          {!loading && products.length === 0 && (
            <p className="text-sm text-gray-500">No hay productos disponibles.</p>
          )}

          {products.map((p) => (
            <div key={String(p.id)} className="border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="w-[130px] h-[130px] mx-auto mb-3 relative">
                <Image src={p.image ?? '/productos/placeholder.png'} alt={p.name} fill className="object-contain" />
              </div>
              <h3 className="font-semibold text-lg">{p.name}</h3>
              <p className="text-sm text-gray-700 mb-4">{p.description}</p>

              {/* Quantity Selector */}
              <div className="flex items-center gap-3 mb-4">
                <button className="bg-gray-200 px-3 py-1 rounded-md" onClick={() => updateQty(p.name, (cart[p.name] ?? 0) - 1)}>–</button>
                <span className="w-8 text-center font-semibold">{cart[p.name] ?? 0}</span>
                <button className="bg-gray-200 px-3 py-1 rounded-md" onClick={() => updateQty(p.name, (cart[p.name] ?? 0) + 1)}>+</button>
              </div>

              {/* Add Button */}
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => updateQty(p.name, (cart[p.name] ?? 0) + 1)}>
                {p.price ?? 0} puntos — Agregar
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <div className="w-[320px] space-y-6">
        {/* CART */}
        <div className="bg-[#F7FCFA] border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-lg mb-3">Carrito de compra</h3>

          <table className="w-full text-sm mb-4">
            <thead className="text-left text-gray-600">
              <tr>
                <th>Producto</th>
                <th>Cant.</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(cart).filter(([, qty]) => qty > 0).map(([name, qty]) => {
                const product = products.find((p) => p.name === name);
                return (
                  <tr key={name}>
                    <td>{name}</td>
                    <td>{qty}</td>
                    <td>{(product?.price ?? 0) * qty}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <p className="font-semibold mb-4">Monto Total: {total} puntos</p>

          <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={handleBuyClick}>
            Comprar
          </Button>
          {insufficientMsg && <p className="text-sm text-red-600 mt-2">{insufficientMsg}</p>}
        </div>

        {/* ACCUMULATED POINTS */}
        <div className="bg-[#F7FCFA] border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold mb-2">Puntos acumulados</h3>
          <p className="text-xl font-bold">{displayPoints} puntos</p>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-xl w-[400px] border border-gray-200">
            <h3 className="text-blue-600 font-semibold mb-3">Confirmacion Compra</h3>

            <p className="mb-6 text-gray-700">
              Estás realizando una compra <br />Seguro que deseas utilizar <strong>{total} puntos</strong> por la compra en el comercio de <strong>{storeName}</strong>? <br />Una vez confirmado, podrás verificar el código de la transacción realizada en tu historial de compras, el cual deberás presentar en el comercio.
            </p>

            <div className="flex justify-end gap-3">
              <Button
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={() => setShowModal(false)}
                disabled={processingPurchase}
              >
                Cancelar
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleConfirm}
                disabled={processingPurchase}
              >
                {processingPurchase ? 'Procesando...' : 'Confirmar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StorePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <StoreInner />
    </Suspense>
  );
}
