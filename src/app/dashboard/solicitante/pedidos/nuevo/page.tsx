"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Search, Plus, ShoppingCart, Trash2, PackagePlus, AlertCircle, ArrowLeft, ChevronRight, LogOut, User, ShoppingBag, MapPin, Mail, Facebook, Linkedin, Loader2, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import { productosService } from "@/services/productos.service";
import { solicitudesService } from "@/services/solicitudes.service";
import { useAuthStore } from "@/stores/auth.store";

interface Producto {
  id: number;
  bodegaId: number;
  codigoProducto: string;
  nombreProducto: string;
  ubicacion?: string;
  tallaMedida?: string;
  formato: string;
  cantidad: number;
  observacion?: string;
}

interface ItemCarrito {
  productoId: number | null; 
  nombreDisplay: string;
  codigoDisplay: string;
  formatoDisplay?: string;
  cantidad: number;
  temporalNombre?: string;
  temporalCodigo?: string;
  temporalUnidad?: string;
  temporalTalla?: string;
  observacion?: string;
  tipoItem: "NORMAL" | "AGOTADO" | "NUEVO";
}

export default function NuevaSolicitudPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [productosFiltrados, setProductosFiltrados] = useState<Producto[]>([]);
  const [cargandoProductos, setCargandoProductos] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [isManualMode, setIsManualMode] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const [manualItem, setManualItem] = useState({
    productoId: null as number | null,
    nombre: "",
    codigo: "",
    unidad: "",
    talla: "",
    observacion: "",
  });

  const [cantidad, setCantidad] = useState(1);
  const [proyecto, setProyecto] = useState("");
  const [observacionesGral, setObservacionesGral] = useState(""); 
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const data = await productosService.getAll();
        setProductos(data);
        setProductosFiltrados(data);
      } catch {
        toast.error("Error al cargar el catálogo de productos");
      } finally {
        setCargandoProductos(false);
      }
    };
    cargarProductos();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setProductosFiltrados(productos);
    } else {
      const filtro = productos.filter((p) =>
        p.nombreProducto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.codigoProducto.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setProductosFiltrados(filtro);
    }
  }, [searchTerm, productos]);

  const productosSinStock = productos.filter(p => p.cantidad <= 0);

  const handleSelectSinStock = (idString: string) => {
    if (!idString) {
      setManualItem({ productoId: null, nombre: "", codigo: "", unidad: "", talla: "", observacion: manualItem.observacion });
      return;
    }
    const prod = productos.find(p => p.id.toString() === idString);
    if (prod) {
      setManualItem({
        productoId: prod.id,
        nombre: prod.nombreProducto,
        codigo: prod.codigoProducto,
        unidad: prod.formato, 
        talla: prod.tallaMedida || "",
        observacion: manualItem.observacion 
      });
    }
  };

  const agregarDesdeCatalogo = (producto: Producto) => {
    if (carrito.find((item) => item.productoId === producto.id)) {
      return toast.error("Este producto ya está en el carrito");
    }

    const item: ItemCarrito = {
      productoId: producto.id,
      nombreDisplay: producto.nombreProducto,
      codigoDisplay: producto.codigoProducto,
      formatoDisplay: producto.formato,
      cantidad: cantidad,
      tipoItem: "NORMAL"
    };

    if (carrito.length > 0 && carrito[0].tipoItem !== "NORMAL") {
      toast.warning(`Se limpió el carrito porque no puedes mezclar NORMAL con ${carrito[0].tipoItem}.`, { duration: 5000 });
      setCarrito([item]);
    } else {
      setCarrito([...carrito, item]);
      toast.success(`${producto.nombreProducto} agregado`);
    }
    setCantidad(1);
  };

  const agregarManual = () => {
    if (!manualItem.nombre) return toast.error("El nombre del material es obligatorio");
    if (!manualItem.unidad) return toast.error("Debes especificar una unidad");

    const isAgotado = manualItem.productoId !== null;
    const tipoItem = isAgotado ? "AGOTADO" : "NUEVO";

    const item: ItemCarrito = {
      productoId: manualItem.productoId,
      nombreDisplay: manualItem.nombre,
      codigoDisplay: manualItem.codigo || (isAgotado ? "" : "S/C"),
      formatoDisplay: manualItem.unidad,
      cantidad: cantidad,
      temporalNombre: isAgotado ? undefined : manualItem.nombre,
      temporalCodigo: isAgotado ? undefined : manualItem.codigo,
      temporalUnidad: isAgotado ? undefined : manualItem.unidad,
      temporalTalla: isAgotado ? undefined : manualItem.talla,
      observacion: manualItem.observacion,
      tipoItem: tipoItem
    };

    if (carrito.length > 0 && carrito[0].tipoItem !== tipoItem) {
      toast.warning(`Se limpió el carrito porque no puedes mezclar ${tipoItem} con ${carrito[0].tipoItem}.`, { duration: 5000 });
      setCarrito([item]);
    } else {
      setCarrito([...carrito, item]);
      toast.success(`Ítem ${tipoItem} agregado`);
    }
    
    setManualItem({ productoId: null, nombre: "", codigo: "", unidad: "", talla: "", observacion: "" });
    setCantidad(1);
  };

  const eliminarDelCarrito = (index: number) => {
    const nuevo = [...carrito];
    nuevo.splice(index, 1);
    setCarrito(nuevo);
  };

  const finalizarPedido = async () => {
    if (!proyecto) return toast.error("Falta ingresar el Proyecto / Obra");
    if (carrito.length === 0) return toast.error("El carrito está vacío");

    const tipoPedido = carrito[0].tipoItem;
    
    // ✅ CAMBIO: Ya no es obligatorio ingresar una justificación para pedidos especiales
    setEnviando(true);
    try {
      const detallesSolicitud = carrito.map(item => ({
        productoId: item.productoId,
        cantidad: item.cantidad,
        temporalNombre: item.temporalNombre || null,
        temporalCodigo: item.temporalCodigo || null,
        temporalUnidad: item.temporalUnidad || null,
        temporalTalla: item.temporalTalla || null,
        observacion: item.observacion || null,
      }));

      await solicitudesService.create({
        proyecto,
        observaciones: observacionesGral, // Se envía lo que haya (incluso vacío)
        tipoPedido, 
        detalles: detallesSolicitud,
      });

      toast.success("¡Solicitud enviada exitosamente!");
      setProyecto("");
      setObservacionesGral("");
      setCarrito([]);
      window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { error?: string } | string } };
      if (err.response?.status === 400 && err.response.data) {
        const errorMsg = typeof err.response.data === 'string' ? err.response.data : err.response.data.error;
        if (errorMsg) {
          toast.error(errorMsg, { duration: 6000 });
          setCarrito([]);
          return;
        }
      }
      toast.error("Error al enviar la solicitud");
    } finally {
      setEnviando(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const requiereJustificacion = carrito.length > 0 && carrito[0].tipoItem !== "NORMAL";

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans selection:bg-red-500/20">
      <header className="fixed top-0 w-full z-50 transition-all duration-300 border-b border-slate-200 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between max-w-6xl">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image src="https://res.cloudinary.com/dsljo0xlb/image/upload/v1768900061/ByG_ingeniera_logo_isltvf.png" alt="Logo ByG" width={160} height={60} className="h-10 w-auto object-contain" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#D32F2F] uppercase tracking-widest mt-0.5">Nueva Solicitud</span>
            </div>
          </Link>

          <div className="relative">
            <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 outline-none">
              <div className="h-9 w-9 rounded-full bg-[#D32F2F] text-white flex items-center justify-center shadow-md">
                <span className="font-bold text-sm">{user?.nombres ? user.nombres.charAt(0).toUpperCase() : <User className="w-5 h-5" />}</span>
              </div>
              <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isUserMenuOpen ? "rotate-90" : ""}`} />
            </button>

            {isUserMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-4 bg-slate-50 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-900 truncate">{user?.nombres} {user?.apellidos}</p>
                    <p className="text-xs text-[#D32F2F] font-semibold uppercase tracking-wider mt-0.5">{user?.rol}</p>
                  </div>
                  <div className="p-2 space-y-1">
                    {user?.rol === "Administrador" && (
                      <Link href="/dashboard/admin" className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-[#D32F2F] bg-red-50 hover:bg-red-100 rounded-lg transition-colors mb-1">
                        <ShieldCheck className="w-4 h-4" /> Panel Admin
                      </Link>
                    )}
                    {user?.rol === "Bodeguero" && (
                      <Link href="/dashboard/bodeguero" className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-[#D32F2F] bg-red-50 hover:bg-red-100 rounded-lg transition-colors mb-1">
                        <Truck className="w-4 h-4" /> Portal Bodega
                      </Link>
                    )}
                    <Link href="/dashboard/solicitante" className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                      <ShoppingBag className="w-4 h-4" /> Mis Pedidos
                    </Link>
                  </div>
                  <div className="h-px bg-slate-100 mx-2 my-1" />
                  <div className="p-2">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left">
                      <LogOut className="w-4 h-4" /> Cerrar Sesión
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
            <Link href="/">
              <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-slate-300 hover:border-[#D32F2F] hover:text-[#D32F2F] transition-all">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Crear Nueva Solicitud</h1>
              <p className="text-slate-500 mt-1">Completa los datos de la obra y selecciona los materiales.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-t-4 border-t-[#D32F2F] shadow-md border-x-0 border-b-0">
                <CardHeader className="pb-4 border-b border-slate-100">
                  <CardTitle className="flex justify-between items-center text-xl">
                    <span className="flex items-center gap-2"><Search className="w-5 h-5 text-[#D32F2F]" /> Catálogo de Materiales</span>
                    {!isManualMode && (
                      <Button variant="ghost" size="sm" className="text-xs text-[#D32F2F] hover:text-red-700 hover:bg-red-50" onClick={() => setIsManualMode(true)}>
                        <AlertCircle className="w-3 h-3 mr-1" /> ¿No hay existencia en bodega?
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {!isManualMode ? (
                    <div className="space-y-6">
                      <div className="relative group">
                        <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-[#D32F2F] transition-colors" />
                        <Input placeholder="Buscar por código o nombre..." className="pl-10 h-12 text-base border-slate-200 focus-visible:ring-[#D32F2F]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} autoFocus />
                      </div>
                      
                      <div className="h-[450px] overflow-y-auto border rounded-xl bg-slate-50/50 pr-2 custom-scrollbar">
                        {cargandoProductos ? (
                          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3"><Loader2 className="w-8 h-8 animate-spin" /><p>Cargando catálogo...</p></div>
                        ) : productosFiltrados.length > 0 ? (
                          productosFiltrados.map((mat) => (
                            <div key={mat.id} className="p-4 border-b border-slate-100 hover:bg-white hover:shadow-sm transition-all flex justify-between items-center group bg-white mx-2 mt-2 rounded-lg first:mt-2 last:mb-2">
                              <div className="flex-1">
                                <p className="font-bold text-slate-800 text-lg">{mat.nombreProducto}</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-mono border">{mat.codigoProducto}</span>
                                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">{mat.formato} {mat.tallaMedida ? `- Talla: ${mat.tallaMedida}` : ""}</span>
                                  <span className={`text-xs px-2 py-1 rounded border ${mat.cantidad > 0 ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-700 border-red-100"}`}>Stock: {mat.cantidad}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 pl-4">
                                <Input type="number" min="1" className="w-20 h-10 text-center font-bold" placeholder="1" onChange={(e) => setCantidad(parseInt(e.target.value) || 1)} />
                                <Button size="sm" className="h-10 w-10 p-0 rounded-lg bg-[#D32F2F] hover:bg-red-700 transition-colors shadow-sm" onClick={() => agregarDesdeCatalogo(mat)} disabled={mat.cantidad <= 0}>
                                  <Plus className="w-6 h-6 text-white" />
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3"><AlertCircle className="w-8 h-8 opacity-40" /><p>No se encontraron productos.</p></div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 animate-in fade-in slide-in-from-bottom-4">
                      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-orange-200/50">
                        <div className="bg-orange-100 p-2 rounded-lg text-orange-700"><PackagePlus className="w-6 h-6" /></div>
                        <div>
                          <h3 className="font-bold text-orange-900 text-lg">Solicitud Especial / Sin Stock</h3>
                          <p className="text-sm text-orange-700">Pide material que se acabó en bodega o que está fuera del catálogo.</p>
                        </div>
                      </div>

                      {productosSinStock.length > 0 && (
                        <div className="mb-6 p-4 bg-white rounded-lg border border-orange-200 shadow-sm">
                          <Label className="text-orange-900 font-bold mb-2 block">¿Es un producto del catálogo que se quedó sin stock?</Label>
                          <select 
                            className="flex h-11 w-full rounded-md border border-orange-300 bg-orange-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 text-orange-900 font-medium"
                            onChange={(e) => handleSelectSinStock(e.target.value)}
                            value={manualItem.productoId?.toString() || ""}
                          >
                            <option value="">No, es un material totalmente nuevo (Fuera de catálogo)</option>
                            {productosSinStock.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.codigoProducto} - {p.nombreProducto} (Agotado)
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                        <div className="space-y-2 md:col-span-2">
                            <Label className="text-orange-900 font-semibold">Nombre del Material *</Label>
                            <Input placeholder="Ej: Disco de corte especial..." className="bg-white border-orange-200 focus-visible:ring-orange-500 h-11" value={manualItem.nombre} onChange={(e) => setManualItem({ ...manualItem, nombre: e.target.value })} autoFocus />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-orange-900">Marca / Modelo / Código</Label>
                          <Input placeholder="Ej: Bosch..." className="bg-white border-orange-200 focus-visible:ring-orange-500" value={manualItem.codigo} onChange={(e) => setManualItem({ ...manualItem, codigo: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-orange-900">Unidad *</Label>
                            <select className="flex h-10 w-full rounded-md border border-orange-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500" value={manualItem.unidad} onChange={(e) => setManualItem({ ...manualItem, unidad: e.target.value })}>
                                <option value="">Seleccione...</option>
                                <option value="UNIDAD">Unidad (C/U)</option>
                                <option value="METRO">Metros (mts)</option>
                                <option value="LITRO">Litros (L)</option>
                                <option value="CAJA">Caja / Paquete</option>
                                <option value="JUEGO">Juego / Set</option>
                                <option value="GLOBAL">Global</option>
                                {manualItem.productoId && manualItem.unidad && !["UNIDAD","METRO","LITRO","CAJA","JUEGO","GLOBAL"].includes(manualItem.unidad) && (
                                  <option value={manualItem.unidad}>{manualItem.unidad}</option>
                                )}
                            </select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label className="text-orange-900">Observación Específica</Label>
                            <Input placeholder="Ej: Únicamente de esta medida..." className="bg-white border-orange-200 focus-visible:ring-orange-500" value={manualItem.observacion} onChange={(e) => setManualItem({ ...manualItem, observacion: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-orange-900">Talla / Medida</Label>
                          <Input placeholder="Ej: XL, 10mm..." className="bg-white border-orange-200 focus-visible:ring-orange-500" value={manualItem.talla} onChange={(e) => setManualItem({ ...manualItem, talla: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-orange-900 font-bold">Cantidad *</Label>
                          <Input type="number" min="1" className="bg-white border-orange-200 focus-visible:ring-orange-500 font-bold" value={cantidad} onChange={(e) => setCantidad(parseInt(e.target.value) || 1)} />
                        </div>
                      </div>
                      
                      <div className="flex gap-3 justify-end pt-2">
                        <Button variant="ghost" onClick={() => setIsManualMode(false)} className="hover:bg-orange-100 hover:text-orange-900">Cancelar</Button>
                        <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-md border-0" onClick={agregarManual}>
                          <Plus className="w-4 h-4 mr-2" /> Agregar al Pedido
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="h-full flex flex-col shadow-xl border-slate-200 lg:sticky lg:top-28">
                <CardHeader className="bg-[#D32F2F] text-white py-4 rounded-t-lg"><CardTitle className="flex items-center gap-2 text-lg"><ShoppingCart className="w-5 h-5 text-white" />Resumen del Pedido</CardTitle></CardHeader>
                <CardContent className="flex-1 flex flex-col gap-5 pt-6 bg-slate-50/50">
                  <div className="space-y-4 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Proyecto / Obra *</Label>
                      <Input placeholder="Ej: Montaje Sala Eléctrica" value={proyecto} onChange={(e) => setProyecto(e.target.value)} className="bg-slate-50 border-slate-200 focus-visible:ring-[#D32F2F]" />
                    </div>
                    
                    {requiereJustificacion && (
                      <div className="space-y-2 mt-4 animate-in fade-in zoom-in duration-300">
                        {/* ✅ CAMBIO: Etiqueta actualizada a (Opcional) */}
                        <Label className="text-xs font-bold text-orange-600 uppercase tracking-wider">Justificación Pedido Especial (Opcional)</Label>
                        <textarea placeholder="Explica por qué solicitas estos materiales..." value={observacionesGral} onChange={(e) => setObservacionesGral(e.target.value)} className="w-full min-h-[80px] text-sm border border-orange-200 bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-md p-3 transition-all" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm font-bold text-slate-700 px-1"><span>Materiales seleccionados</span><span className="bg-[#D32F2F] text-white px-2.5 py-0.5 rounded-full text-xs">{carrito.length}</span></div>
                  <div className="flex-1 overflow-y-auto max-h-[350px] min-h-[150px] space-y-3 pr-1 custom-scrollbar">
                    {carrito.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl p-8 bg-white/50"><ShoppingBag className="w-10 h-10 opacity-10 mb-3" /><p>El carrito está vacío</p></div>
                    ) : (
                      carrito.map((item, idx) => (
                        <div key={idx} className={`flex flex-col text-sm p-3 rounded-lg border shadow-sm group transition-all bg-white hover:shadow-md ${item.tipoItem !== "NORMAL" ? "border-l-4 border-l-orange-400" : "border-slate-100"}`}>
                          <div className="flex justify-between items-start">
                            <div className="flex-1 mr-3">
                              <div className="flex items-center gap-2 mb-1">
                                {item.tipoItem === "NUEVO" && <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-[10px] h-5">NUEVO</Badge>}
                                {item.tipoItem === "AGOTADO" && <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-[10px] h-5">AGOTADO</Badge>}
                              </div>
                              <p className={`font-semibold line-clamp-2 leading-snug ${item.tipoItem !== "NORMAL" ? "text-orange-800" : "text-slate-800"}`}>{item.nombreDisplay}</p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-xs font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">Cant: {item.cantidad}</span>
                                {item.productoId && <span className="text-[10px] text-blue-600 font-medium px-1.5 py-0.5 bg-blue-50 rounded">{item.formatoDisplay}</span>}
                                {!item.productoId && item.temporalTalla && <span className="text-[10px] text-orange-600 font-medium px-1.5 py-0.5 bg-orange-50 rounded">Talla: {item.temporalTalla}</span>}
                              </div>
                            </div>
                            <button onClick={() => eliminarDelCarrito(idx)} className="text-slate-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                          </div>
                          
                          {item.observacion && (
                            <div className="mt-2 text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 italic">
                                &quot;{item.observacion}&quot;
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  <Button className="w-full bg-[#D32F2F] hover:bg-red-700 text-white mt-auto py-7 text-lg font-bold shadow-lg shadow-red-200 transition-all hover:-translate-y-1" onClick={finalizarPedido} disabled={enviando || carrito.length === 0}>
                    {enviando ? <div className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Enviando...</div> : "Confirmar Solicitud"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-[#CCCCCC]" style={{ backgroundColor: "#222222" }}>
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="grid md:grid-cols-3 gap-10">
            <div className="space-y-4">
              <div className="flex items-center gap-2 opacity-90"><Image src="https://res.cloudinary.com/dsljo0xlb/image/upload/v1768940307/LOGO-BYG_BLANCO-PNG_zdbhuy.png" alt="Logo ByG" width={160} height={60} className="h-16 w-auto object-contain" /></div>
              <p className="text-sm leading-relaxed text-gray-400">Soluciones integrales en ingeniería y abastecimiento industrial.</p>
              <div className="flex gap-3">
                <a href="#" className="w-8 h-8 rounded-full bg-[#333333] flex items-center justify-center hover:bg-[#D32F2F] transition-colors text-white"><Linkedin className="w-4 h-4" /></a>
                <a href="#" className="w-8 h-8 rounded-full bg-[#333333] flex items-center justify-center hover:bg-[#D32F2F] transition-colors text-white"><Facebook className="w-4 h-4" /></a>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold mb-4 text-white border-b-2 border-[#D32F2F] inline-block pb-1 uppercase tracking-wider">Enlaces</h3>
              <ul className="space-y-2 text-sm text-gray-400"><li><Link href="/" className="hover:text-white transition-colors">Inicio</Link></li><li><Link href="/dashboard/solicitante" className="hover:text-white transition-colors">Mis Pedidos</Link></li></ul>
            </div>
            <div>
              <h3 className="text-sm font-bold mb-4 text-white border-b-2 border-[#D32F2F] inline-block pb-1 uppercase tracking-wider">Contacto</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-start gap-3"><MapPin className="w-4 h-4 text-[#D32F2F] mt-0.5" /><span>Antofagasta, Chile<br />Montaje Eléctrico e Instrumentación</span></li>
                <li className="flex items-center gap-3"><Mail className="w-4 h-4 text-[#D32F2F]" /><span>contacto@byg-ingenieria.cl</span></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="py-4 text-center text-xs text-gray-600 border-t border-[#333333] bg-[#1a1a1a]">© {new Date().getFullYear()} ByG Ingeniería. Todos los derechos reservados.</div>
      </footer>
    </div>
  );
}