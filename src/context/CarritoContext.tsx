"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Producto } from "@/types";
import { useAuth } from "./AuthContext";

interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

// ✅ Agregar interfaz para el item del backend
interface ItemCarritoDB {
  producto: Producto;
  cantidad: number;
}

interface CarritoContextType {
  items: ItemCarrito[];
  agregarProducto: (producto: Producto, cantidad?: number) => Promise<void>;
  quitarProducto: (productoId: number) => Promise<void>;
  actualizarCantidad: (productoId: number, cantidad: number) => Promise<void>;
  vaciarCarrito: () => Promise<void>;
  totalItems: number;
  subtotal: number;
  costoEnvio: number;
  total: number;
  loading: boolean;
}

const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

const STORAGE_KEY = "xyntral_carrito";
const ENVIO_GRATIS_THRESHOLD = 2;
const COSTO_ENVIO = 5000;

export function CarritoProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Usar useCallback para memoizar loadCarrito
  const loadCarrito = useCallback(async () => {
    if (isAuthenticated && user?.rol === "cliente") {
      try {
        const res = await fetch("/api/carrito", {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          // ✅ Usar ItemCarritoDB en lugar de any
          setItems(
            data.items.map((item: ItemCarritoDB) => ({
              producto: item.producto,
              cantidad: item.cantidad,
            }))
          );
        }
      } catch (error) {
        console.error("Error al cargar carrito:", error);
      }
    } else {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          setItems(JSON.parse(saved));
        } catch (error) {
          console.error("Error al cargar carrito:", error);
        }
      }
    }
  }, [isAuthenticated, user?.rol]); // ✅ Dependencias correctas

  // ✅ Cargar carrito al montar
  useEffect(() => {
    setMounted(true);
    loadCarrito();
  }, [loadCarrito]); // ✅ Ahora loadCarrito está en las dependencias

  // ✅ Guardar en localStorage solo si NO hay usuario
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, mounted, isAuthenticated]);

  const agregarProducto = async (producto: Producto, cantidad: number = 1) => {
    setLoading(true);
    try {
      if (isAuthenticated && user?.rol === "cliente") {
        const res = await fetch("/api/carrito", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ producto_id: producto.id, cantidad }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Error al agregar");
        }

        await loadCarrito();
      } else {
        setItems((prevItems) => {
          const existente = prevItems.find(
            (item) => item.producto.id === producto.id
          );

          if (existente) {
            return prevItems.map((item) =>
              item.producto.id === producto.id
                ? { ...item, cantidad: item.cantidad + cantidad }
                : item
            );
          } else {
            return [...prevItems, { producto, cantidad }];
          }
        });
      }
    } catch (error) {
      console.error("Error al agregar producto:", error);
      alert(
        error instanceof Error ? error.message : "Error al agregar al carrito"
      );
    } finally {
      setLoading(false);
    }
  };

  const quitarProducto = async (productoId: number) => {
    setLoading(true);
    try {
      if (isAuthenticated && user?.rol === "cliente") {
        const item = items.find((i) => i.producto.id === productoId);
        if (!item) return;

        const res = await fetch(`/api/carrito/${item.producto.id}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (!res.ok) throw new Error("Error al quitar");

        await loadCarrito();
      } else {
        setItems((prevItems) =>
          prevItems.filter((item) => item.producto.id !== productoId)
        );
      }
    } catch (error) {
      console.error("Error al quitar producto:", error);
    } finally {
      setLoading(false);
    }
  };

  const actualizarCantidad = async (productoId: number, cantidad: number) => {
    if (cantidad <= 0) {
      await quitarProducto(productoId);
      return;
    }

    setLoading(true);
    try {
      if (isAuthenticated && user?.rol === "cliente") {
        const item = items.find((i) => i.producto.id === productoId);
        if (!item) return;

        const res = await fetch(`/api/carrito/${item.producto.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ cantidad }),
        });

        if (!res.ok) throw new Error("Error al actualizar");

        await loadCarrito();
      } else {
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.producto.id === productoId ? { ...item, cantidad } : item
          )
        );
      }
    } catch (error) {
      console.error("Error al actualizar cantidad:", error);
    } finally {
      setLoading(false);
    }
  };

  const vaciarCarrito = async () => {
    setLoading(true);
    try {
      if (isAuthenticated && user?.rol === "cliente") {
        const res = await fetch("/api/carrito", {
          method: "DELETE",
          credentials: "include",
        });

        if (!res.ok) throw new Error("Error al vaciar");
      }

      setItems([]);
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error al vaciar carrito:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.cantidad, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.producto.precio * item.cantidad,
    0
  );
  const costoEnvio = totalItems >= ENVIO_GRATIS_THRESHOLD ? 0 : COSTO_ENVIO;
  const total = subtotal + costoEnvio;

  const value: CarritoContextType = {
    items,
    agregarProducto,
    quitarProducto,
    actualizarCantidad,
    vaciarCarrito,
    totalItems,
    subtotal,
    costoEnvio,
    total,
    loading,
  };

  return (
    <CarritoContext.Provider value={value}>{children}</CarritoContext.Provider>
  );
}

export function useCarrito() {
  const context = useContext(CarritoContext);
  if (context === undefined) {
    throw new Error("useCarrito debe usarse dentro de CarritoProvider");
  }
  return context;
}