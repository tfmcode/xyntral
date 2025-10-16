"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingCart, Menu, X, User, Package } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Detectar scroll para cambiar estilo
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // TODO: Obtener cantidad de items del carrito desde el contexto/API
  useEffect(() => {
    // Placeholder - implementar cuando tengamos el contexto del carrito
    setCartCount(0);
  }, []);

  const isActive = (path: string) => pathname === path;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-md"
          : "bg-white border-b border-gray-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar - Solo desktop */}
        <div className="hidden lg:flex items-center justify-between py-2 text-sm border-b border-gray-100">
          <div className="flex items-center gap-6 text-gray-600">
            <span className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Envío gratis desde 2da unidad
            </span>
            <span>•</span>
            <span>Pagos seguros con Mercado Pago</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/sobre-nosotros"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Sobre Nosotros
            </Link>
            <Link
              href="/preguntas-frecuentes"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              FAQ
            </Link>
          </div>
        </div>

        {/* Main navbar */}
        <div className="flex items-center justify-between h-20 lg:h-24">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="text-2xl lg:text-3xl font-extrabold">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                xyntral
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link
              href="/"
              className={`font-medium transition-colors ${
                isActive("/")
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              Inicio
            </Link>

            <Link
              href="/productos"
              className={`font-medium transition-colors ${
                isActive("/productos")
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              Productos
            </Link>

            <Link
              href="/sobre-nosotros"
              className={`font-medium transition-colors ${
                isActive("/sobre-nosotros")
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              Sobre Nosotros
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3 lg:gap-4">
            {/* Search - Desktop */}
            <Link
              href="/productos"
              className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors text-gray-600"
            >
              <Search className="w-4 h-4" />
              <span className="text-sm">Buscar</span>
            </Link>

            {/* Cart */}
            <Link
              href="/carrito"
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Carrito de compras"
            >
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Account */}
            {user ? (
              <div className="hidden lg:flex items-center gap-2">
                <Link
                  href={user.rol === "admin" ? "/admin" : "/cuenta"}
                  className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <User className="w-5 h-5 text-gray-700" />
                  <span className="text-sm font-medium text-gray-700">
                    {user.rol === "admin" ? "Admin" : "Mi Cuenta"}
                  </span>
                </Link>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/registro"
                  className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                >
                  Registrarse
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={showMenu ? "Cerrar menú" : "Abrir menú"}
            >
              {showMenu ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden transition-all duration-300 ease-in-out ${
            showMenu
              ? "max-h-[600px] opacity-100 visible pb-6"
              : "max-h-0 opacity-0 invisible overflow-hidden"
          }`}
        >
          <nav className="pt-4 space-y-1">
            <Link
              href="/"
              onClick={() => setShowMenu(false)}
              className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive("/")
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Inicio
            </Link>

            <Link
              href="/productos"
              onClick={() => setShowMenu(false)}
              className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive("/productos")
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Productos
            </Link>

            <Link
              href="/sobre-nosotros"
              onClick={() => setShowMenu(false)}
              className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Sobre Nosotros
            </Link>

            <Link
              href="/preguntas-frecuentes"
              onClick={() => setShowMenu(false)}
              className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Preguntas Frecuentes
            </Link>

            {/* User actions mobile */}
            <div className="pt-4 border-t border-gray-200 space-y-2">
              {user ? (
                <>
                  <Link
                    href={user.rol === "admin" ? "/admin" : "/cuenta"}
                    onClick={() => setShowMenu(false)}
                    className="block px-4 py-3 rounded-lg bg-gray-100 text-gray-700 font-medium text-center"
                  >
                    {user.rol === "admin" ? "Panel Admin" : "Mi Cuenta"}
                  </Link>
                  {user.rol === "cliente" && (
                    <Link
                      href="/cuenta/pedidos"
                      onClick={() => setShowMenu(false)}
                      className="block px-4 py-3 rounded-lg text-gray-700 text-center"
                    >
                      Mis Pedidos
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setShowMenu(false)}
                    className="block px-4 py-3 rounded-lg border-2 border-blue-600 text-blue-600 font-medium text-center"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/registro"
                    onClick={() => setShowMenu(false)}
                    className="block px-4 py-3 rounded-lg bg-blue-600 text-white font-medium text-center"
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
