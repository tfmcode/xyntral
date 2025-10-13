"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/productos/ProductsCard";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Grid3x3,
  List,
  SlidersHorizontal,
} from "lucide-react";
import type { Producto, Categoria } from "@/types";

export default function ProductsContent() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);

  const searchParams = useSearchParams();
  const router = useRouter();

  const filtros = {
    categoria: searchParams.get("categoria") || "",
    busqueda: searchParams.get("busqueda") || "",
    precioMin: Number(searchParams.get("precioMin")) || 0,
    precioMax: Number(searchParams.get("precioMax")) || 100000,
    soloStock: searchParams.get("soloStock") === "true",
    destacado: searchParams.get("destacado") === "true",
    orden: searchParams.get("orden") || "reciente",
  };

  const paginaActual = parseInt(searchParams.get("pagina") || "1", 10);
  const productosPorPagina = 12;

  // Cargar productos
  const loadProductos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtros.categoria) params.append("categoria", filtros.categoria);
      if (filtros.busqueda) params.append("busqueda", filtros.busqueda);
      if (filtros.precioMin) params.append("precioMin", String(filtros.precioMin));
      if (filtros.precioMax) params.append("precioMax", String(filtros.precioMax));
      if (filtros.soloStock) params.append("soloStock", "true");
      if (filtros.destacado) params.append("destacado", "true");
      params.append("ordenar", filtros.orden);

      const res = await fetch(`/api/productos?${params.toString()}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        setProductos(data.data);
      } else {
        console.error("Formato de respuesta inesperado:", data);
        setProductos([]);
      }
    } catch (error) {
      console.error("Error al cargar productos:", error);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  // Cargar categorías
  useEffect(() => {
    const loadCategorias = async () => {
      try {
        const res = await fetch("/api/categorias");
        const data = await res.json();
        
        if (data.success && Array.isArray(data.data)) {
          setCategorias(data.data);
        }
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      }
    };

    loadCategorias();
  }, []);

  useEffect(() => {
    loadProductos();
  }, [loadProductos]);

  // Calcular rango de precios
  useEffect(() => {
    if (productos.length > 0) {
      const precios = productos.map((p) => p.precio);
      setPriceRange([Math.floor(Math.min(...precios)), Math.ceil(Math.max(...precios))]);
    }
  }, [productos]);

  // Ordenar productos
  const productosOrdenados = [...productos].sort((a, b) => {
    switch (filtros.orden) {
      case "precio_asc":
        return a.precio - b.precio;
      case "precio_desc":
        return b.precio - a.precio;
      case "nombre_asc":
        return a.nombre.localeCompare(b.nombre);
      case "nombre_desc":
        return b.nombre.localeCompare(a.nombre);
      case "popular":
        return (b.ventas || 0) - (a.ventas || 0);
      case "reciente":
      default:
        return new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime();
    }
  });

  // Paginación
  const totalPaginas = Math.ceil(productosOrdenados.length / productosPorPagina);
  const indiceInicial = (paginaActual - 1) * productosPorPagina;
  const productosPaginados = productosOrdenados.slice(
    indiceInicial,
    indiceInicial + productosPorPagina
  );

  const actualizarQuery = (nuevo: Record<string, string>) => {
    const query = new URLSearchParams(searchParams.toString());
    Object.entries(nuevo).forEach(([key, value]) => {
      if (value === "" || value === "0") query.delete(key);
      else query.set(key, value);
    });
    router.push(`/productos?${query.toString()}`);
  };

  const limpiarFiltros = () => {
    router.push("/productos");
  };

  const filtrosActivos =
    filtros.categoria ||
    filtros.busqueda ||
    filtros.precioMin > 0 ||
    filtros.precioMax < 100000 ||
    filtros.soloStock ||
    filtros.destacado;

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 px-4 py-8 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded w-64 mb-3"></div>
              <div className="h-5 bg-gray-200 rounded w-48"></div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse"
              >
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Hero */}
      <div className="bg-gradient-to-r from-blue-50 via-white to-purple-50 border-b border-gray-200 px-4 py-8 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
                Nuestros Productos
              </h1>
              <p className="text-gray-600 text-base sm:text-lg">
                {productosOrdenados.length} producto{productosOrdenados.length !== 1 ? "s" : ""} disponible
                {productosOrdenados.length !== 1 ? "s" : ""}
                {filtros.categoria && ` en ${filtros.categoria.replace(/-/g, " ")}`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Toggle vista móvil */}
              <div className="hidden sm:flex bg-white rounded-lg border border-gray-200 p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded transition ${
                    viewMode === "grid"
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  title="Vista de cuadrícula"
                >
                  <Grid3x3 size={18} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded transition ${
                    viewMode === "list"
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  title="Vista de lista"
                >
                  <List size={18} />
                </button>
              </div>

              {/* Botón filtros móvil */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-md hover:bg-blue-700 transition"
              >
                <SlidersHorizontal size={16} />
                Filtros
                {filtrosActivos && (
                  <span className="w-5 h-5 bg-yellow-400 text-blue-900 rounded-full text-xs font-bold flex items-center justify-center">
                    !
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Sidebar Filtros */}
          <aside
            className={`lg:col-span-1 mb-8 lg:mb-0 ${
              showFilters ? "block" : "hidden lg:block"
            }`}
          >
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Filter size={18} />
                  Filtros
                </h2>
                {filtrosActivos && (
                  <button
                    onClick={limpiarFiltros}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Búsqueda */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Buscar
                  </label>
                  <input
                    type="text"
                    placeholder="Nombre del producto..."
                    value={filtros.busqueda}
                    onChange={(e) =>
                      actualizarQuery({ busqueda: e.target.value, pagina: "1" })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Categorías */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Categorías
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={() => actualizarQuery({ categoria: "", pagina: "1" })}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                        !filtros.categoria
                          ? "bg-blue-50 text-blue-700 font-semibold"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Todas las categorías
                    </button>
                    {categorias
                      .filter((c) => !c.parent_id)
                      .map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() =>
                            actualizarQuery({ categoria: cat.slug, pagina: "1" })
                          }
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                            filtros.categoria === cat.slug
                              ? "bg-blue-50 text-blue-700 font-semibold"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {cat.nombre}
                          {cat.productos_count !== undefined && (
                            <span className="float-right text-xs text-gray-500">
                              ({cat.productos_count})
                            </span>
                          )}
                        </button>
                      ))}
                  </div>
                </div>

                {/* Precio */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Rango de Precio
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Mín"
                        value={filtros.precioMin || ""}
                        onChange={(e) =>
                          actualizarQuery({
                            precioMin: e.target.value,
                            pagina: "1",
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="number"
                        placeholder="Máx"
                        value={filtros.precioMax === 100000 ? "" : filtros.precioMax}
                        onChange={(e) =>
                          actualizarQuery({
                            precioMax: e.target.value || "100000",
                            pagina: "1",
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Precio: ${priceRange[0].toLocaleString()} - $
                      {priceRange[1].toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Disponibilidad */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Disponibilidad
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filtros.soloStock}
                      onChange={(e) =>
                        actualizarQuery({
                          soloStock: e.target.checked ? "true" : "",
                          pagina: "1",
                        })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Solo productos en stock
                    </span>
                  </label>
                </div>

                {/* Destacados */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filtros.destacado}
                      onChange={(e) =>
                        actualizarQuery({
                          destacado: e.target.checked ? "true" : "",
                          pagina: "1",
                        })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 font-medium">
                      Solo productos destacados
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Productos */}
          <div className="lg:col-span-3">
            {/* Barra de ordenamiento */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-gray-600">
                Mostrando{" "}
                <span className="font-semibold text-gray-900">
                  {Math.min(indiceInicial + 1, productosOrdenados.length)}
                </span>{" "}
                -{" "}
                <span className="font-semibold text-gray-900">
                  {Math.min(
                    indiceInicial + productosPorPagina,
                    productosOrdenados.length
                  )}
                </span>{" "}
                de{" "}
                <span className="font-semibold text-gray-900">
                  {productosOrdenados.length}
                </span>
              </div>

              <select
                value={filtros.orden}
                onChange={(e) =>
                  actualizarQuery({ orden: e.target.value, pagina: "1" })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="reciente">Más recientes</option>
                <option value="popular">Más populares</option>
                <option value="precio_asc">Precio: menor a mayor</option>
                <option value="precio_desc">Precio: mayor a menor</option>
                <option value="nombre_asc">Nombre: A-Z</option>
                <option value="nombre_desc">Nombre: Z-A</option>
              </select>
            </div>

            {/* Grid/List de productos */}
            {productosPaginados.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No se encontraron productos
                </h3>
                <p className="text-gray-600 mb-6">
                  Intentá ajustar los filtros o buscar con otros términos
                </p>
                {filtrosActivos && (
                  <button
                    onClick={limpiarFiltros}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    <X size={16} />
                    Limpiar todos los filtros
                  </button>
                )}
              </div>
            ) : (
              <>
                <div
                  className={`grid gap-6 ${
                    viewMode === "grid"
                      ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                      : "grid-cols-1"
                  }`}
                >
                  {productosPaginados.map((producto) => (
                    <ProductCard
                      key={producto.id}
                      producto={producto}
                      viewMode={viewMode}
                    />
                  ))}
                </div>

                {/* Paginación */}
                {totalPaginas > 1 && (
                  <div className="mt-8 flex justify-center">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          actualizarQuery({
                            pagina: String(Math.max(1, paginaActual - 1)),
                          })
                        }
                        disabled={paginaActual === 1}
                        className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        <ChevronLeft size={18} />
                      </button>

                      {[...Array(totalPaginas)].map((_, i) => {
                        const page = i + 1;
                        if (
                          page === 1 ||
                          page === totalPaginas ||
                          (page >= paginaActual - 1 && page <= paginaActual + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() =>
                                actualizarQuery({ pagina: String(page) })
                              }
                              className={`px-4 py-2 rounded-lg font-medium transition ${
                                paginaActual === page
                                  ? "bg-blue-600 text-white"
                                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (
                          page === paginaActual - 2 ||
                          page === paginaActual + 2
                        ) {
                          return (
                            <span key={page} className="px-2 text-gray-400">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}

                      <button
                        onClick={() =>
                          actualizarQuery({
                            pagina: String(
                              Math.min(totalPaginas, paginaActual + 1)
                            ),
                          })
                        }
                        disabled={paginaActual === totalPaginas}
                        className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}