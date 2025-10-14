"use client";

import { useEffect, useState } from "react";
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  Clock,
  AlertCircle,
  Plus,
  ArrowRight,
  DollarSign,
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  total_productos: number;
  productos_activos: number;
  productos_destacados: number;
  productos_sin_stock: number;
  total_pedidos: number;
  pedidos_pendientes: number;
  pedidos_hoy: number;
  total_clientes: number;
  ventas_mes: number;
  ingresos_mes: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // TODO: Implementar endpoint /api/admin/stats para e-commerce
    // Por ahora datos mock
    setTimeout(() => {
      setStats({
        total_productos: 0,
        productos_activos: 0,
        productos_destacados: 0,
        productos_sin_stock: 0,
        total_pedidos: 0,
        pedidos_pendientes: 0,
        pedidos_hoy: 0,
        total_clientes: 0,
        ventas_mes: 0,
        ingresos_mes: 0,
      });
      setLoading(false);
    }, 500);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    href,
    subtitle,
  }: {
    title: string;
    value: number;
    icon: React.ElementType;
    color: string;
    href: string;
    subtitle?: string;
  }) => (
    <Link href={href} className="group">
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 group-hover:border-blue-200 group-hover:shadow-blue-100/50">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-12 h-12 bg-${color}-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
          >
            <Icon size={24} className="text-white" />
          </div>
          <ArrowRight
            size={20}
            className={`text-gray-400 group-hover:text-${color}-500 transition-colors`}
          />
        </div>

        <div className="space-y-2">
          <div className="text-2xl font-bold text-gray-900">
            {loading ? (
              <div className="w-12 h-8 bg-gray-200 rounded animate-pulse" />
            ) : (
              value.toLocaleString()
            )}
          </div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </Link>
  );

  const quickActions = [
    {
      title: "Nuevo Producto",
      description: "Agregar producto al catálogo",
      icon: Package,
      href: "/admin/productos",
      color: "blue",
    },
    {
      title: "Ver Pedidos",
      description: "Gestionar pedidos pendientes",
      icon: ShoppingCart,
      href: "/admin/pedidos",
      color: "green",
    },
    {
      title: "Ver Tienda",
      description: "Ir al sitio público",
      icon: TrendingUp,
      href: "/",
      color: "purple",
      external: true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Package size={24} className="text-white" />
            </div>
            Panel de Administración
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona productos, pedidos y usuarios desde aquí.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock size={16} />
            <span>
              Última actualización:{" "}
              {new Date().toLocaleTimeString("es-AR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Productos"
          value={stats?.total_productos || 0}
          icon={Package}
          color="blue"
          href="/admin/productos"
          subtitle="En el catálogo"
        />
        <StatCard
          title="Pedidos Pendientes"
          value={stats?.pedidos_pendientes || 0}
          icon={ShoppingCart}
          color="amber"
          href="/admin/pedidos"
          subtitle="Requieren atención"
        />
        <StatCard
          title="Clientes"
          value={stats?.total_clientes || 0}
          icon={Users}
          color="green"
          href="/admin/usuarios"
          subtitle="Registrados"
        />
        <StatCard
          title="Ventas del Mes"
          value={stats?.ventas_mes || 0}
          icon={TrendingUp}
          color="purple"
          href="/admin/pedidos"
          subtitle="Pedidos completados"
        />
      </div>

      {/* Grid de contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Acciones rápidas */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Plus size={20} className="text-blue-500" />
              Acciones Rápidas
            </h2>

            <div className="space-y-3">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  target={action.external ? "_blank" : undefined}
                  className="group flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <action.icon size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">
                      {action.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight
                    size={16}
                    className="text-gray-400 group-hover:text-blue-500 transition-colors"
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Info adicional */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Estado del Sistema
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Productos activos</span>
                <span className="font-semibold text-green-600">
                  {stats?.productos_activos || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sin stock</span>
                <span className="font-semibold text-red-600">
                  {stats?.productos_sin_stock || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Destacados</span>
                <span className="font-semibold text-amber-600">
                  {stats?.productos_destacados || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ingresos y estadísticas */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <DollarSign size={20} className="text-green-500" />
              Resumen de Ventas
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <DollarSign size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-green-700 font-medium">
                      Ingresos del Mes
                    </p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-green-900">
                  ${(stats?.ingresos_mes || 0).toLocaleString()}
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <ShoppingCart size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-700 font-medium">
                      Pedidos Hoy
                    </p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-blue-900">
                  {stats?.pedidos_hoy || 0}
                </p>
              </div>
            </div>

            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={16} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-900 mb-1">
                    Próximas funcionalidades
                  </p>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Estadísticas de ventas, gráficos de rendimiento y reportes
                    detallados estarán disponibles próximamente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
