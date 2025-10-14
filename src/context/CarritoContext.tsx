"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Producto } from "@/types";
import { useAuth } from "./AuthContext";

interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

// Estructura que devuelve la API / DB
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

  // Cargar carrito (DB si logueado, localStorage si invitado)
  const loadCarrito = useCallback(async () => {
    if (isAuthenticated && user?.rol === "cliente") {
      try {
        const res = await fetch("/api/carrito", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setItems(
            (data.items as ItemCarritoDB[]).map((item) => ({
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
          setItems(JSON.parse(saved) as ItemCarrito[]);
        } catch (error) {
          console.error("Error al cargar carrito:", error);
        }
      }
    }
  }, [isAuthenticated, user?.rol]);

  // Montaje
  useEffect(() => {
    setMounted(true);
    void loadCarrito();
  }, [loadCarrito]);

  // Persistir en localStorage solo para invitados
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, mounted, isAuthenticated]);

  // Agregar producto
  const agregarProducto = useCallback(
    async (producto: Producto, cantidad: number = 1) => {
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
          setItems((prev) => {
            const existente = prev.find((i) => i.producto.id === producto.id);
            if (existente) {
              return prev.map((i) =>
                i.producto.id === producto.id
                  ? { ...i, cantidad: i.cantidad + cantidad }
                  : i
              );
            }
            return [...prev, { producto, cantidad }];
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
    },
    [isAuthenticated, user?.rol, loadCarrito]
  );

  // Quitar producto
  const quitarProducto = useCallback(
    async (productoId: number) => {
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
          setItems((prev) => prev.filter((i) => i.producto.id !== productoId));
        }
      } catch (error) {
        console.error("Error al quitar producto:", error);
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, user?.rol, items, loadCarrito]
  );

  // Actualizar cantidad
  const actualizarCantidad = useCallback(
    async (productoId: number, cantidad: number) => {
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
          setItems((prev) =>
            prev.map((i) =>
              i.producto.id === productoId ? { ...i, cantidad } : i
            )
          );
        }
      } catch (error) {
        console.error("Error al actualizar cantidad:", error);
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, user?.rol, items, quitarProducto, loadCarrito]
  );

  // Vaciar carrito
  const vaciarCarrito = useCallback(async () => {
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
  }, [isAuthenticated, user?.rol]);

  // Migrar carrito local al hacer login
  const migrarCarritoLocal = useCallback(async () => {
    const carritoLocal = localStorage.getItem(STORAGE_KEY);
    if (!carritoLocal) return;

    try {
      const itemsLocales: ItemCarrito[] = JSON.parse(carritoLocal);
      for (const item of itemsLocales) {
        await fetch("/api/carrito", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            producto_id: item.producto.id,
            cantidad: item.cantidad,
          }),
        });
      }
      localStorage.removeItem(STORAGE_KEY);
      await loadCarrito();
    } catch (error) {
      console.error("Error al migrar carrito:", error);
    }
  }, [loadCarrito]);

  // Ejecutar migración al loguearse (solo una vez montado)
  useEffect(() => {
    if (mounted && isAuthenticated && user?.rol === "cliente") {
      void migrarCarritoLocal();
    }
  }, [mounted, isAuthenticated, user?.rol, migrarCarritoLocal]);

  const totalItems = items.reduce((sum, i) => sum + i.cantidad, 0);
  const subtotal = items.reduce(
    (sum, i) => sum + i.producto.precio * i.cantidad,
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
