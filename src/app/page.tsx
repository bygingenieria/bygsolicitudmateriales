"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  PackageSearch,
  ArrowRight,
  LogOut,
  MapPin,
  Phone,
  Mail,
  Facebook,
  Linkedin,
  ChevronRight,
  Loader2,
  User,
  ShoppingBag,
  ShieldCheck,
  Truck,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();

  const [isMounted, setIsMounted] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    router.refresh();
  };

  const bgGradient = "from-[#D32F2F] to-orange-600";

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white overflow-hidden selection:bg-red-500/20 font-sans">
      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 transition-all duration-300 border-b border-slate-200 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer select-none"
            >
              <div className="h-10 w-auto relative flex items-center">
                <Image
                  src="https://res.cloudinary.com/dsljo0xlb/image/upload/v1768900061/ByG_ingeniera_logo_isltvf.png"
                  alt="Logo ByG"
                  width={400}
                  height={200}
                  className="h-10 w-auto object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#D32F2F] uppercase tracking-widest mt-0.5">
                  Solicitud de Productos
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center justify-end gap-4">
            {isAuthenticated ? (
              <div className="relative z-50">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 outline-none select-none"
                >
                  <div className="h-9 w-9 rounded-full bg-[#D32F2F] text-white flex items-center justify-center shadow-md">
                    <span className="font-bold text-sm">
                      {user?.nombres ? (
                        user.nombres.charAt(0).toUpperCase()
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                    </span>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isUserMenuOpen ? "rotate-90" : ""}`}
                  />
                </button>

                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40 cursor-default"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-4 py-4 bg-slate-50 border-b border-slate-100">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {user?.nombres || "Usuario"} {user?.apellidos || ""}
                        </p>
                        <p className="text-xs text-[#D32F2F] font-semibold uppercase tracking-wider mt-0.5">
                          {user?.rol || "Rol Desconocido"}
                        </p>
                        <p className="text-xs text-slate-400 truncate mt-1">
                          {user?.email || ""}
                        </p>
                      </div>

                      <div className="p-2 space-y-1">
                        {user?.rol === "Administrador" && (
                          <Link
                            href="/dashboard/admin"
                            className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-[#D32F2F] bg-red-50 hover:bg-red-100 rounded-lg transition-colors mb-1"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <div className="bg-white p-1.5 rounded-md shadow-sm">
                              <ShieldCheck className="w-4 h-4 text-[#D32F2F]" />
                            </div>{" "}
                            Panel Admin
                          </Link>
                        )}
                        {/* ✅ CORRECCIÓN AQUÍ: Ahora dirige a /dashboard/bodeguero (El portal de 2 opciones) */}
                        {user?.rol === "Bodeguero" && (
                          <Link
                            href="/dashboard/bodeguero"
                            className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-[#D32F2F] bg-red-50 hover:bg-red-100 rounded-lg transition-colors mb-1"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <div className="bg-white p-1.5 rounded-md shadow-sm">
                              <Truck className="w-4 h-4 text-[#D32F2F]" />
                            </div>{" "}
                            Portal Bodega
                          </Link>
                        )}
                        <Link
                          href="/dashboard/cuenta"
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <div className="bg-slate-100 p-1.5 rounded-md">
                            <User className="w-4 h-4 text-slate-500" />
                          </div>{" "}
                          Ver Cuenta
                        </Link>
                        <Link
                          href="/dashboard/solicitante"
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <div className="bg-slate-100 p-1.5 rounded-md">
                            <ShoppingBag className="w-4 h-4 text-slate-500" />
                          </div>{" "}
                          Mis Pedidos
                        </Link>
                      </div>
                      <div className="h-px bg-slate-100 mx-2 my-1" />
                      <div className="p-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                        >
                          <div className="bg-red-50 p-1.5 rounded-md">
                            <LogOut className="w-4 h-4 text-red-500" />
                          </div>{" "}
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/login">
                <Button className="rounded-full font-bold shadow-lg shadow-red-600/20 transition-all hover:scale-105 hover:shadow-red-600/40 text-white border-0 bg-[#D32F2F] hover:bg-red-700">
                  Iniciar Sesión
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative isolate pt-32 pb-20 md:pt-48 md:pb-40 overflow-hidden min-h-[600px] flex items-center">
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2070&auto=format&fit=crop')",
            }}
          ></div>
          <div className="absolute inset-0 bg-slate-900/75 backdrop-blur-[2px]"></div>
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#D32F2F]/20 to-transparent opacity-60"></div>
        </div>

        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <div className="flex flex-col items-center text-center space-y-8 max-w-5xl mx-auto">
            <h1 className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100 text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl text-white">
              Solicitud de <br className="hidden md:block" />
              <span
                className={`text-transparent bg-clip-text bg-gradient-to-r ${bgGradient}`}
              >
                Productos
              </span>
            </h1>

            <p className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 text-lg md:text-xl text-slate-200 max-w-[700px] leading-relaxed">
              Gestión centralizada en la solicitud de productos. Solicita
              insumos y revisa el estado de tus pedidos en tiempo real.
            </p>

            <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 flex flex-col sm:flex-row gap-6 w-full justify-center mt-10">
              {!isAuthenticated ? (
                <Link href="/login">
                  <Button
                    size="lg"
                    className="h-16 px-10 text-lg rounded-full shadow-xl shadow-red-600/30 hover:shadow-red-600/50 hover:scale-105 transition-all duration-300 w-full sm:w-auto bg-[#D32F2F] hover:bg-red-700 text-white font-bold group"
                  >
                    Ingresar al Portal{" "}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/dashboard/solicitante/pedidos/nuevo">
                    <Button
                      size="lg"
                      className="h-16 px-8 text-lg rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-100 font-bold group flex items-center gap-3"
                    >
                      <div className="bg-slate-100 p-2 rounded-lg group-hover:bg-slate-200 transition-colors">
                        <ClipboardList className="h-6 w-6 text-[#D32F2F]" />
                      </div>
                      Solicitar Producto
                    </Button>
                  </Link>
                  <Link href="/dashboard/solicitante">
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-16 px-8 text-lg rounded-2xl border-2 border-white/30 text-white hover:bg-white/10 hover:border-white shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto font-bold bg-transparent flex items-center gap-3"
                    >
                      <div className="bg-white/10 p-2 rounded-lg group-hover:bg-white/20 transition-colors">
                        <PackageSearch className="h-6 w-6 text-white" />
                      </div>
                      Ver Pedidos
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --- BANNER FINAL --- */}
      <section className="py-24 px-4 bg-white">
        <div className="container mx-auto">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#D32F2F] to-orange-700 px-6 py-20 text-center sm:px-12 md:py-28 shadow-2xl shadow-red-900/20">
            <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>

            <div className="relative z-10 flex flex-col items-center gap-6 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                Resumen del Sistema
              </h2>
              <p className="text-white/90 text-lg md:text-xl max-w-xl leading-relaxed">
                Esta plataforma digitaliza el proceso de abastecimiento de ByG
                Ingeniería. Permite a los trabajadores solicitar material de
                manera eficiente, limpia y con registro de sus pedidos.
              </p>
              {!isAuthenticated && (
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="h-14 px-10 text-lg rounded-full shadow-xl hover:scale-105 transition-transform duration-300 font-bold bg-white text-[#D32F2F] hover:bg-slate-50 mt-4"
                  >
                    Ingresar al Sistema <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="text-[#CCCCCC]" style={{ backgroundColor: "#222222" }}>
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Image
                  src="https://res.cloudinary.com/dsljo0xlb/image/upload/v1768940307/LOGO-BYG_BLANCO-PNG_zdbhuy.png"
                  alt="Logo ByG"
                  width={96}
                  height={96}
                  className="h-24 w-auto object-contain opacity-90"
                />
              </div>
              <p className="text-xl leading-relaxed text-gray-400">
                Entregamos soluciones tecnológicas para optimizar procesos
                industriales y energéticos.
              </p>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-[#333333] flex items-center justify-center hover:bg-[#D32F2F] transition-colors text-white"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-[#333333] flex items-center justify-center hover:bg-[#D32F2F] transition-colors text-white"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-6 text-white border-b-2 border-[#D32F2F] inline-block pb-1">
                Navegación
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href="/"
                    className="hover:text-[#D32F2F] transition-colors cursor-pointer flex items-center gap-2 group"
                  >
                    <ChevronRight className="w-4 h-4 text-[#D32F2F]" /> Inicio
                  </Link>
                </li>
                <li className="hover:text-[#D32F2F] transition-colors cursor-pointer flex items-center gap-2 group">
                  <ChevronRight className="w-4 h-4 text-[#D32F2F]" /> Servicios
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-6 text-white border-b-2 border-[#D32F2F] inline-block pb-1">
                Contacto
              </h3>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-white mt-1" />
                  <span>
                    Román Díaz 205, Oficina 102,
                    <br />
                    Providencia, Santiago.
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-white" />
                  <span>+56 9 1234 5678</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-white" />
                  <span className="hover:text-[#D32F2F] transition-colors">
                    contacto@byg-ingenieria.cl
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div
          className="py-6 text-center text-xs text-gray-500 border-t border-[#333333]"
          style={{ backgroundColor: "#111111" }}
        >
          <div className="container mx-auto px-4 flex justify-between items-center">
            <span>
              © {new Date().getFullYear()} ByG Ingeniería. Todos los derechos
              reservados.
            </span>
            <span className="opacity-50">Plataforma Interna</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
