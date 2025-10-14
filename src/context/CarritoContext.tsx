"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Producto } from "@/types";

interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

interface CarritoContextType {
  items: ItemCarrito[];
  agregarProducto: (producto: Producto, cantidad?: number) => void;
  quitarProducto: (productoId: number) => void;
  actualizarCantidad: (productoId: number, cantidad: number) => void;
  vaciarCarrito: () => void;
  totalItems: number;
  subtotal: number;
  costoEnvio: number;
  total: number;
}

const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

const STORAGE_KEY = "xyntral_carrito";
const ENVIO_GRATIS_THRESHOLD = 2; // Envío gratis desde 2da unidad
const COSTO_ENVIO = 5000; // $5000 por defecto

export function CarritoProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const [mounted, setMounted] = useState(false);

  // ✅ Cargar carrito del localStorage al montar
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (error) {
        console.error("Error al cargar carrito:", error);
      }
    }
  }, []);

  // ✅ Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, mounted]);

  const agregarProducto = (producto: Producto, cantidad: number = 1) => {
    setItems((prevItems) => {
      const existente = prevItems.find(
        (item) => item.producto.id === producto.id
      );

      if (existente) {
        // Actualizar cantidad
        return prevItems.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      } else {
        // Agregar nuevo
        return [...prevItems, { producto, cantidad }];
      }
    });
  };

  const quitarProducto = (productoId: number) => {
    setItems((prevItems) =>
      prevItems.filter((item) => item.producto.id !== productoId)
    );
  };

  const actualizarCantidad = (productoId: number, cantidad: number) => {
    if (cantidad <= 0) {
      quitarProducto(productoId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.producto.id === productoId ? { ...item, cantidad } : item
      )
    );
  };

  const vaciarCarrito = () => {
    setItems([]);
  };

  // ✅ Cálculos
  const totalItems = items.reduce((sum, item) => sum + item.cantidad, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.producto.precio * item.cantidad,
    0
  );

  // ✅ Envío gratis desde la 2da unidad
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
