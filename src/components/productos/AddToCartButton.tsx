"use client";

import { useState } from "react";
import { ShoppingCart, Minus, Plus, Check } from "lucide-react";
import type { Producto } from "@/types";

interface Props {
  producto: Producto;
}

const AddToCartButton = ({ producto }: Props) => {
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAgregar = async () => {
    if (producto.stock === 0) return;

    setLoading(true);

    try {
      // TODO: Implementar lógica de agregar al carrito
      // Simulación de delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      console.log("Agregando al carrito:", {
        producto_id: producto.id,
        cantidad,
      });

      // Mostrar feedback de éxito
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
      alert("Error al agregar al carrito. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const incrementar = () => {
    if (cantidad < producto.stock) {
      setCantidad((prev) => prev + 1);
    }
  };

  const decrementar = () => {
    if (cantidad > 1) {
      setCantidad((prev) => prev - 1);
    }
  };

  const sinStock = producto.stock === 0;

  return (
    <div className="space-y-4">
      {/* Selector de cantidad */}
      {!sinStock && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Cantidad
          </label>
          <div className="flex items-center gap-4">
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={decrementar}
                disabled={cantidad <= 1}
                className="p-3 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Disminuir cantidad"
              >
                <Minus size={18} />
              </button>
              <input
                type="number"
                min="1"
                max={producto.stock}
                value={cantidad}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (val >= 1 && val <= producto.stock) {
                    setCantidad(val);
                  }
                }}
                className="w-16 text-center font-semibold text-gray-900 focus:outline-none"
              />
              <button
                onClick={incrementar}
                disabled={cantidad >= producto.stock}
                className="p-3 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Aumentar cantidad"
              >
                <Plus size={18} />
              </button>
            </div>
            <span className="text-sm text-gray-600">
              {producto.stock} disponible{producto.stock !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleAgregar}
          disabled={sinStock || loading || added}
          className={`flex-1 inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
            added
              ? "bg-green-600 text-white"
              : sinStock
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg active:scale-95"
          }`}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Agregando...</span>
            </>
          ) : added ? (
            <>
              <Check size={20} />
              <span>¡Agregado!</span>
            </>
          ) : sinStock ? (
            <>
              <ShoppingCart size={20} />
              <span>Sin stock</span>
            </>
          ) : (
            <>
              <ShoppingCart size={20} />
              <span>Agregar al carrito</span>
            </>
          )}
        </button>

        <button
          disabled={sinStock}
          className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Comprar ahora
        </button>
      </div>

      {/* Info adicional */}
      {!sinStock && cantidad >= 2 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800 font-medium">
            ✓ ¡Envío gratis! Comprando {cantidad} unidades
          </p>
          <p className="text-xs text-green-700 mt-1">
            Total: ${(producto.precio * cantidad).toLocaleString()}
          </p>
        </div>
      )}

      {/* Ahorro con descuento */}
      {!sinStock && producto.precio_anterior && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 font-medium">
            ¡Ahorrás $
            {(
              (producto.precio_anterior - producto.precio) *
              cantidad
            ).toLocaleString()}{" "}
            comprando {cantidad} unidad{cantidad !== 1 ? "es" : ""}!
          </p>
        </div>
      )}
    </div>
  );
};

export default AddToCartButton;
