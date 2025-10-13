"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

// =====================================================
// TIPOS
// =====================================================

export interface User {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  rol: "cliente" | "admin";
  activo: boolean;
  email_verificado: boolean;
  fecha_registro: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshUser: () => Promise<void>;
  login: (user: User) => void;
}

// =====================================================
// CONTEXT
// =====================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =====================================================
// PROVIDER
// =====================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  // Determinar tipo de ruta
  const isAdminRoute = pathname.startsWith("/admin");
  const isCuentaRoute = pathname.startsWith("/cuenta");
  const isCheckoutRoute = pathname.startsWith("/checkout");
  const isAuthRoute = pathname === "/login" || pathname === "/registro";
  const isPrivateRoute = isAdminRoute || isCuentaRoute || isCheckoutRoute;

  // Valores computados
  const isAuthenticated = !!user;
  const isAdmin = user?.rol === "admin";

  // =====================================================
  // VERIFICAR AUTENTICACIÓN
  // =====================================================

  const fetchUser = async (): Promise<User | null> => {
    try {
      console.log("🔄 [Auth] Verificando autenticación...");

      const res = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      if (!res.ok) {
        if (isPrivateRoute) {
          console.warn("⚠️ [Auth] No autorizado en ruta privada");
        } else {
          console.log("ℹ️ [Auth] Usuario no autenticado (ruta pública)");
        }
        throw new Error("No autorizado");
      }

      const data = await res.json();
      const userData = data.user || data.usuario;

      if (!userData) {
        throw new Error("No se recibió información del usuario");
      }

      console.log(
        "✅ [Auth] Usuario autenticado:",
        userData.email,
        "-",
        userData.rol
      );
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("❌ [Auth] Error al verificar autenticación:", error);
      setUser(null);
      return null;
    }
  };

  // =====================================================
  // VERIFICACIÓN AUTOMÁTICA AL MONTAR
  // =====================================================

  useEffect(() => {
    const initAuth = async () => {
      // Solo verificar automáticamente en rutas privadas o de auth
      if (isPrivateRoute || isAuthRoute) {
        if (!hasCheckedAuth) {
          console.log("🚀 [Auth] Iniciando verificación automática");
          setLoading(true);
          await fetchUser();
          setLoading(false);
          setHasCheckedAuth(true);
        }
      } else {
        // En rutas públicas, marcar como verificado sin hacer request
        if (!hasCheckedAuth) {
          console.log("ℹ️ [Auth] Ruta pública - marcando como verificada");
          setLoading(false);
          setHasCheckedAuth(true);
        }
      }
    };

    initAuth();
  }, [pathname, hasCheckedAuth]);

  // =====================================================
  // VERIFICACIÓN MANUAL (útil después de login)
  // =====================================================

  const checkAuth = async () => {
    console.log("🔄 [Auth] Verificación manual solicitada");
    setLoading(true);
    setHasCheckedAuth(false);
    await fetchUser();
    setLoading(false);
    setHasCheckedAuth(true);
  };

  // =====================================================
  // REFRESCAR DATOS DEL USUARIO
  // =====================================================

  const refreshUser = async () => {
    if (!user) {
      console.log("ℹ️ [Auth] No hay usuario para refrescar");
      return;
    }

    try {
      console.log("🔄 [Auth] Refrescando datos del usuario...");
      const updatedUser = await fetchUser();

      if (updatedUser) {
        console.log("✅ [Auth] Usuario actualizado:", updatedUser.email);
      } else {
        console.warn("⚠️ [Auth] No se pudo refrescar el usuario");
      }
    } catch (error) {
      console.error("❌ [Auth] Error al refrescar usuario:", error);
      throw error;
    }
  };

  // =====================================================
  // LOGIN MANUAL (desde componentes)
  // =====================================================

  const login = (userData: User) => {
    console.log("✅ [Auth] Login manual:", userData.email);
    setUser(userData);
    setHasCheckedAuth(true);
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = async () => {
    try {
      console.log("👋 [Auth] Cerrando sesión...");

      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      console.log("✅ [Auth] Sesión cerrada");
    } catch (error) {
      console.error("❌ [Auth] Error al cerrar sesión:", error);
    } finally {
      // Limpiar estado local siempre
      setUser(null);
      setHasCheckedAuth(false);
      setLoading(false);

      // Redirigir a login
      router.push("/login");
    }
  };

  // =====================================================
  // PROTECCIÓN DE RUTAS (opcional)
  // =====================================================

  useEffect(() => {
    if (!loading && hasCheckedAuth) {
      // Redirigir a login si intentan acceder a rutas privadas sin auth
      if (isPrivateRoute && !user) {
        console.warn("⚠️ [Auth] Acceso denegado - redirigiendo a login");
        router.push("/login");
        return;
      }

      // Redirigir a home si intentan acceder a admin sin ser admin
      if (isAdminRoute && user && !isAdmin) {
        console.warn("⚠️ [Auth] Acceso denegado a admin - no es administrador");
        router.push("/");
        return;
      }

      // Redirigir usuarios autenticados que intentan ver login/registro
      if (isAuthRoute && user) {
        console.log("ℹ️ [Auth] Usuario ya autenticado - redirigiendo");
        const redirectTo = user.rol === "admin" ? "/admin" : "/cuenta";
        router.push(redirectTo);
        return;
      }
    }
  }, [loading, hasCheckedAuth, user, pathname]);

  // =====================================================
  // DEBUG (solo en desarrollo)
  // =====================================================

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("🔍 [Auth] Estado:", {
        user: user?.email || "null",
        rol: user?.rol || "null",
        isAuthenticated,
        isAdmin,
        loading,
        hasCheckedAuth,
        pathname,
      });
    }
  }, [user, loading, hasCheckedAuth, pathname]);

  // =====================================================
  // PROVIDER
  // =====================================================

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        isAdmin,
        logout,
        checkAuth,
        refreshUser,
        login,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// =====================================================
// HOOK PERSONALIZADO
// =====================================================

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }

  return context;
}

// Export del contexto para casos especiales
export { AuthContext };
