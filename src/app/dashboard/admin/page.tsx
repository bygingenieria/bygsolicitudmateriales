"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuthStore } from "@/stores/auth.store"
import { Button, buttonVariants } from "@/components/ui/button"
import { 
  Users, 
  ArrowLeft, 
  ShieldCheck,
  Package, 
  Loader2,
  ClipboardList
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function AdminDashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true)
    }, 0)

    // Protección de ruta (Solo Admin)
    if (isMounted) {
        if (!isAuthenticated) {
            router.push("/login")
        } else if (user?.rol !== "Administrador") {
            router.push("/")
        }
    }

    return () => clearTimeout(timer)
  }, [isAuthenticated, user, router, isMounted])

  if (!isMounted || !user || user.rol !== "Administrador") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
         <Loader2 className="h-8 w-8 animate-spin text-[#D32F2F]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 pt-24 font-sans">
      <div className="container mx-auto max-w-6xl space-y-8">
        
        {/* --- ENCABEZADO ADMIN --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-[#D32F2F]" />
              Panel de Administración
            </h1>
            <p className="text-slate-500 mt-2 text-lg">
              Bienvenido, {user.nombres}. Selecciona una opción para gestionar.
            </p>
          </div>
          
          {/* BOTÓN VOLVER (A la página principal) */}
          <Link 
            href="/" 
            className={cn(buttonVariants({ variant: "outline" }), "gap-2 hover:bg-slate-100 hover:text-slate-900 cursor-pointer")}
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio
          </Link>
        </div>

        {/* --- CONTENIDO --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* GESTIÓN DE PEDIDOS (ROJO) */}
          <Card className="hover:shadow-xl transition-all border-l-4 border-l-[#D32F2F] cursor-pointer group bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl group-hover:text-[#D32F2F] transition-colors">
                 <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
                    <ClipboardList className="w-6 h-6 text-[#D32F2F]" />
                 </div>
                Gestión de Pedidos
              </CardTitle>
              <CardDescription className="text-base">
                Revisar solicitudes, aprobar material y ver historial.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/admin/pedidos">
                <Button className="w-full bg-slate-900 hover:bg-[#D32F2F] text-white font-semibold h-12 transition-colors">
                  Administrar Pedidos
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* GESTIÓN DE INVENTARIO (NARANJA/ROJO) */}
          <Card className="hover:shadow-xl transition-all border-l-4 border-l-[#D32F2F] cursor-pointer group bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl group-hover:text-[#D32F2F] transition-colors">
                 <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
                    <Package className="w-6 h-6 text-[#D32F2F]" />
                 </div>
                Gestión de Inventario
              </CardTitle>
              <CardDescription className="text-base">
                Control de existencias, catálogo y almacén físico.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/inventario">
                <Button className="w-full bg-slate-900 hover:bg-[#D32F2F] text-white font-semibold h-12 transition-colors">
                  Control de Stock
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* GESTIÓN DE USUARIOS (GRIS OSCURO/ROJO) */}
          <Card className="hover:shadow-xl transition-all border-l-4 border-l-[#D32F2F] cursor-pointer group bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl group-hover:text-[#D32F2F] transition-colors">
                <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
                    <Users className="w-6 h-6 text-[#D32F2F]" />
                </div>
                Gestión de Usuarios
              </CardTitle>
              <CardDescription className="text-base">
                Crear usuarios, editar roles y dar de baja personal.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/admin/usuarios">
                <Button className="w-full bg-slate-900 hover:bg-[#D32F2F] text-white font-semibold h-12 transition-colors">
                  Administrar Usuarios
                </Button>
              </Link>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}