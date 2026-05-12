"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { 
  ClipboardList, Package, ChevronRight, User, LogOut, 
  MapPin, Mail, ShieldCheck, Truck, ShoppingBag 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BodegueroDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      {/* Header Institucional - Basado en Nueva Solicitud */}
      <header className="fixed top-0 w-full z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between max-w-6xl">
          <Link href="/" className="flex items-center gap-3">
            <Image src="https://res.cloudinary.com/dsljo0xlb/image/upload/v1768900061/ByG_ingeniera_logo_isltvf.png" alt="Logo ByG" width={160} height={60} className="h-10 w-auto object-contain" />
            <div className="flex flex-col border-l border-slate-200 pl-3">
              <span className="text-[10px] font-bold text-[#D32F2F] uppercase tracking-widest mt-0.5">Portal Bodega</span>
            </div>
          </Link>

          <div className="relative">
            <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 outline-none">
              <div className="h-9 w-9 rounded-full bg-[#D32F2F] text-white flex items-center justify-center shadow-md">
                <span className="font-bold text-sm">{user?.nombres?.charAt(0).toUpperCase()}</span>
              </div>
              <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isUserMenuOpen ? "rotate-90" : ""}`} />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-4 py-4 bg-slate-50 border-b border-slate-100">
                  <p className="text-sm font-bold text-slate-900 truncate">{user?.nombres} {user?.apellidos}</p>
                  <p className="text-xs text-[#D32F2F] font-semibold uppercase tracking-wider mt-0.5">{user?.rol}</p>
                </div>
                <div className="p-2 space-y-1">
                  <Link href="/dashboard/solicitante" className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                    <ShoppingBag className="w-4 h-4" /> Mis Pedidos Personales
                  </Link>
                </div>
                <div className="h-px bg-slate-100 mx-2 my-1" />
                <div className="p-2">
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left">
                    <LogOut className="w-4 h-4" /> Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Bienvenido al Panel de Control</h1>
            <p className="text-slate-500 mt-2 text-lg">Selecciona una de las áreas de gestión para comenzar.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Gestión de Pedidos */}
            <Card className="group hover:shadow-2xl transition-all duration-300 border-t-4 border-t-[#D32F2F] cursor-pointer" onClick={() => router.push("/dashboard/bodeguero/pedidos")}>
              <CardHeader className="pt-8 text-center">
                <div className="mx-auto bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <ClipboardList className="h-10 w-10 text-[#D32F2F]" />
                </div>
                <CardTitle className="text-2xl font-bold text-slate-800">Gestión de Pedidos</CardTitle>
              </CardHeader>
              <CardContent className="text-center pb-8 px-8">
                <p className="text-slate-500 mb-6 leading-relaxed">Revisa las solicitudes de materiales, aprueba entregas y gestiona el flujo de pedidos de obra.</p>
                <Button className="bg-[#D32F2F] hover:bg-red-700 w-full h-12 font-bold text-base shadow-lg shadow-red-100">
                  Ver Solicitudes <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Gestión de Inventario */}
            <Card className="group hover:shadow-2xl transition-all duration-300 border-t-4 border-t-orange-500 cursor-pointer" onClick={() => router.push("/dashboard/inventario")}>
              <CardHeader className="pt-8 text-center">
                <div className="mx-auto bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Package className="h-10 w-10 text-orange-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-slate-800">Gestión de Inventario</CardTitle>
              </CardHeader>
              <CardContent className="text-center pb-8 px-8">
                <p className="text-slate-500 mb-6 leading-relaxed">Actualiza el stock real de bodega, añade nuevos materiales al catálogo y edita información técnica.</p>
                <Button variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-50 w-full h-12 font-bold text-base">
                  Control de Stock <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer Estándar ByG */}
      <footer className="bg-[#222222] text-[#CCCCCC] mt-auto">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="grid md:grid-cols-3 gap-10 text-center md:text-left">
            <div className="space-y-4">
              <Image src="https://res.cloudinary.com/dsljo0xlb/image/upload/v1768940307/LOGO-BYG_BLANCO-PNG_zdbhuy.png" alt="Logo ByG Blanco" width={160} height={60} className="h-16 w-auto object-contain mx-auto md:mx-0" />
              <p className="text-sm text-gray-400">Soluciones integrales en ingeniería y abastecimiento industrial.</p>
            </div>
            <div>
              <h3 className="text-sm font-bold mb-4 text-white border-b-2 border-[#D32F2F] inline-block pb-1 uppercase tracking-wider">Contacto</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-center justify-center md:justify-start gap-3"><MapPin className="w-4 h-4 text-[#D32F2F]" /><span>Antofagasta, Chile</span></li>
                <li className="flex items-center justify-center md:justify-start gap-3"><Mail className="w-4 h-4 text-[#D32F2F]" /><span>contacto@byg-ingenieria.cl</span></li>
              </ul>
            </div>
            <div className="flex flex-col items-center md:items-start">
              <h3 className="text-sm font-bold mb-4 text-white border-b-2 border-[#D32F2F] inline-block pb-1 uppercase tracking-wider">Seguridad</h3>
              <p className="text-xs text-gray-500">Acceso restringido para personal autorizado de ByG Ingeniería.</p>
            </div>
          </div>
        </div>
        <div className="py-4 text-center text-xs text-gray-600 border-t border-[#333333] bg-[#1a1a1a]">© {new Date().getFullYear()} ByG Ingeniería. Todos los derechos reservados.</div>
      </footer>
    </div>
  );
}