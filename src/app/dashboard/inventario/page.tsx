"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Producto, CreateUpdateProductoDto } from "@/types/productos";
import { productosService } from "@/services/productos.service";
import { useAuthStore } from "@/stores/auth.store";
import { 
  Plus, Edit, Trash2, Save, Package, Search, Loader2, ArrowLeft, 
  ChevronRight, ChevronLeft, LogOut, User, ShieldCheck, Truck, ShoppingBag, AlertTriangle 
} from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function InventarioPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  
  // Estados de datos
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productosFiltrados, setProductosFiltrados] = useState<Producto[]>([]);
  
  // Estados de UI
  const [loading, setLoading] = useState<boolean>(true);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [guardando, setGuardando] = useState<boolean>(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Estados de Modal de Borrado
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Estados de Paginación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10; 

  const [formData, setFormData] = useState<CreateUpdateProductoDto>({
    nombreProducto: "", codigoProducto: "", cantidad: 0, formato: "",
    tallaMedida: "", ubicacion: "", observacion: "", bodegaId: 1, activo: true
  });

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const data = await productosService.getAll();
      setProductos(data);
      setProductosFiltrados(data);
    } catch { 
      toast.error("Error al conectar con el servidor de inventario"); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    fetchProductos(); 
  }, []);

  useEffect(() => {
    const lower = searchTerm.toLowerCase();
    const filtrados = productos.filter(p => 
      p.nombreProducto.toLowerCase().includes(lower) || 
      p.codigoProducto.toLowerCase().includes(lower)
    );
    setProductosFiltrados(filtrados);
    setCurrentPage(1); 
  }, [searchTerm, productos]);

  const totalPages = Math.ceil(productosFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProductos = productosFiltrados.slice(startIndex, startIndex + itemsPerPage);

  const generateNextCode = (productosList: Producto[]): string => {
    if (productosList.length === 0) return "ARTOF-001";
    
    let maxNumber = 0;
    let bestPrefix = "ARTOF-";
    let paddingLength = 3;

    productosList.forEach(p => {
      const match = p.codigoProducto.trim().match(/^(.+?)(\d+)$/);
      if (match) {
        const currentNum = parseInt(match[2], 10);
        if (currentNum > maxNumber) {
          maxNumber = currentNum;
          bestPrefix = match[1]; 
          paddingLength = match[2].length; 
        }
      }
    });

    if (maxNumber === 0) return "ARTOF-001";

    const nextNumber = maxNumber + 1;
    const paddedNumber = nextNumber.toString().padStart(paddingLength, "0");

    return `${bestPrefix}${paddedNumber}`;
  };

  const handleOpenDialog = (producto: Producto | null = null) => {
    if (producto) {
      setEditingProduct(producto);
      setFormData({
        nombreProducto: producto.nombreProducto, codigoProducto: producto.codigoProducto,
        cantidad: producto.cantidad, formato: producto.formato || "",
        tallaMedida: producto.tallaMedida || "", ubicacion: producto.ubicacion || "",
        observacion: producto.observacion || "", bodegaId: producto.bodegaId, activo: producto.activo
      });
    } else {
      setEditingProduct(null);
      setFormData({
        nombreProducto: "", 
        codigoProducto: generateNextCode(productos),
        cantidad: 0, formato: "",
        tallaMedida: "", ubicacion: "", observacion: "", bodegaId: 1, activo: true
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGuardando(true);
    try {
      if (editingProduct) await productosService.update(editingProduct.id, formData);
      else await productosService.create(formData);
      toast.success(editingProduct ? "Material actualizado" : "Material registrado");
      setIsDialogOpen(false);
      fetchProductos();
    } catch { 
      toast.error("Revisa los datos e intenta nuevamente."); 
    } finally { 
      setGuardando(false); 
    }
  };

  // --- LÓGICA DE BORRADO CON MODAL PROPIO ---
  const triggerDelete = (id: number) => {
    setProductToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (productToDelete === null) return;
    setDeleting(true);
    try {
      await productosService.delete(productToDelete);
      toast.success("Material eliminado del catálogo.");
      fetchProductos();
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch {
      toast.error("Error al eliminar. Verifica si tienes permisos en el servidor.");
    } finally {
      setDeleting(false);
    }
  };

  const handleLocalStockChange = (id: number, newCantidad: number) => {
    const validCantidad = Math.max(0, newCantidad || 0);
    setProductos(prev => prev.map(p => p.id === id ? { ...p, cantidad: validCantidad } : p));
    setProductosFiltrados(prev => prev.map(p => p.id === id ? { ...p, cantidad: validCantidad } : p));
  };

  const handleSyncStock = async (id: number, cantidad: number) => {
    try {
      await productosService.updateStock(id, Math.max(0, cantidad));
    } catch { 
      toast.error("Error al guardar el stock en la base de datos"); 
      fetchProductos(); 
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <header className="fixed top-0 w-full z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between max-w-6xl">
          <Link href="/" className="flex items-center gap-3">
            <Image src="https://res.cloudinary.com/dsljo0xlb/image/upload/v1768900061/ByG_ingeniera_logo_isltvf.png" alt="Logo" width={160} height={60} className="h-10 w-auto object-contain" />
            <div className="flex flex-col border-l border-slate-200 pl-3">
              <span className="text-[10px] font-bold text-[#D32F2F] uppercase tracking-widest mt-0.5">Inventario Central</span>
            </div>
          </Link>

          <div className="relative">
            <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 outline-none">
              <div className="h-9 w-9 rounded-full bg-[#D32F2F] text-white flex items-center justify-center shadow-md">
                <span className="font-bold text-sm">{user?.nombres?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}</span>
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

      <main className="flex-grow pt-32 pb-20 px-4 max-w-6xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.back()} className="h-10 w-10 rounded-full border-slate-300 hover:border-[#D32F2F] hover:text-[#D32F2F] transition-all">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Control de Almacén</h1>
              <p className="text-slate-500 mt-1">Gestión técnica de materiales y existencias críticas.</p>
            </div>
          </div>
          <Button onClick={() => handleOpenDialog()} className="bg-[#D32F2F] hover:bg-red-700 font-bold gap-2 h-11 px-6 shadow-lg shadow-red-100">
            <Plus className="h-5 w-5" /> Registrar Producto
          </Button>
        </div>

        <Card className="border-t-4 border-t-[#D32F2F] shadow-xl overflow-hidden border-x-0 border-b-0">
          <CardHeader className="bg-white border-b flex flex-row items-center justify-between py-6 px-8">
            <CardTitle className="text-xl flex items-center gap-3"><Package className="h-6 w-6 text-[#D32F2F]" /> Catálogo General</CardTitle>
            <div className="relative w-80">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input placeholder="Filtrar por código o nombre..." className="pl-10 h-10 border-slate-200 bg-slate-50 focus-visible:ring-[#D32F2F]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center py-24 text-slate-400"><Loader2 className="h-12 w-12 animate-spin text-[#D32F2F]" /><p className="mt-4 font-medium">Sincronizando inventario...</p></div>
            ) : (
              <>
                <Table>
                  <TableHeader className="bg-slate-50/80">
                    <TableRow>
                      <TableHead className="pl-8 uppercase text-[10px] font-bold tracking-wider text-slate-500">Código</TableHead>
                      <TableHead className="uppercase text-[10px] font-bold tracking-wider text-slate-500">Material</TableHead>
                      <TableHead className="text-center uppercase text-[10px] font-bold tracking-wider text-slate-500 w-56">Stock Físico</TableHead>
                      <TableHead className="uppercase text-[10px] font-bold tracking-wider text-slate-500">Ubicación</TableHead>
                      <TableHead className="text-right pr-8 uppercase text-[10px] font-bold tracking-wider text-slate-500">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProductos.map((p) => (
                      <TableRow key={p.id} className="hover:bg-slate-50/50 transition-colors border-b-slate-100">
                        <TableCell className="pl-8 font-mono text-xs font-bold text-slate-400">{p.codigoProducto}</TableCell>
                        
                        <TableCell>
                          <p className="font-extrabold text-slate-800 text-base">{p.nombreProducto}</p>
                        </TableCell>

                        {/* COLUMNA STOCK INTERACTIVA (Limpia sin el texto deforme) */}
                        <TableCell>
                          <div className="flex items-center justify-center gap-3">
                            <Button 
                              size="icon" 
                              variant="outline" 
                              className="h-8 w-8 text-[#D32F2F] border-red-200 hover:bg-red-50 flex-shrink-0" 
                              onClick={() => {
                                const newVal = Math.max(0, p.cantidad - 1);
                                handleLocalStockChange(p.id, newVal);
                                handleSyncStock(p.id, newVal);
                              }}
                            >
                              -
                            </Button>
                            
                            <Input
                              type="number"
                              min="0"
                              className={`w-20 h-9 text-center font-black text-lg p-0 focus-visible:ring-2 focus-visible:ring-[#D32F2F] border-slate-200 bg-white ${p.cantidad < 5 ? "text-red-600" : "text-green-700"}`}
                              value={p.cantidad === 0 ? "" : p.cantidad}
                              placeholder="0"
                              onChange={(e) => {
                                const val = e.target.value === "" ? 0 : parseInt(e.target.value);
                                handleLocalStockChange(p.id, val);
                              }}
                              onBlur={() => handleSyncStock(p.id, p.cantidad)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSyncStock(p.id, p.cantidad);
                              }}
                            />

                            <Button 
                              size="icon" 
                              variant="outline" 
                              className="h-8 w-8 text-green-600 border-green-200 hover:bg-green-50 flex-shrink-0" 
                              onClick={() => {
                                const newVal = p.cantidad + 1;
                                handleLocalStockChange(p.id, newVal);
                                handleSyncStock(p.id, newVal);
                              }}
                            >
                              +
                            </Button>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold uppercase w-fit mb-1">{p.formato || "Unidad"}</span>
                            <span className="text-xs text-slate-500 font-medium italic">{p.ubicacion || "Sin ubicación fija"}</span>
                          </div>
                        </TableCell>

                        <TableCell className="text-right pr-8 space-x-1">
                          <Button size="icon" variant="ghost" className="text-slate-400 hover:text-[#D32F2F] hover:bg-red-50 rounded-lg" onClick={() => handleOpenDialog(p)}><Edit className="h-4 w-4" /></Button>
                          {/* Llamada al nuevo modal de borrado */}
                          <Button size="icon" variant="ghost" className="text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg" onClick={() => triggerDelete(p.id)}><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {productosFiltrados.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                          No se encontraron materiales con ese criterio.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {/* CONTROLES DE PAGINACIÓN */}
                {productosFiltrados.length > 0 && (
                  <div className="flex items-center justify-between px-8 py-4 border-t bg-slate-50/50">
                    <div className="text-xs font-medium text-slate-500">
                      Mostrando <span className="font-bold text-slate-800">{startIndex + 1}</span> a <span className="font-bold text-slate-800">{Math.min(startIndex + itemsPerPage, productosFiltrados.length)}</span> de <span className="font-bold text-slate-800">{productosFiltrados.length}</span> materiales
                    </div>
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="h-8 gap-1 text-slate-600"
                      >
                        <ChevronLeft className="w-4 h-4" /> Anterior
                      </Button>
                      <span className="text-xs font-bold text-slate-700">
                        Pág. {currentPage} de {totalPages}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="h-8 gap-1 text-slate-600"
                      >
                        Siguiente <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>

      {/* FOOTER INSTITUCIONAL */}
      <footer className="bg-[#222222] text-[#CCCCCC] mt-auto">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-10">
            <div className="space-y-4 text-center md:text-left">
              <Image src="https://res.cloudinary.com/dsljo0xlb/image/upload/v1768940307/LOGO-BYG_BLANCO-PNG_zdbhuy.png" alt="Logo" width={160} height={60} className="mx-auto md:mx-0 h-16 w-auto object-contain" />
              <p className="text-xs text-gray-500 max-w-xs">Módulo de gestión de materiales para el personal de ByG Ingeniería.</p>
            </div>
          </div>
        </div>
        <div className="py-4 text-center text-[10px] text-gray-700 bg-[#1a1a1a] border-t border-[#333333]">© {new Date().getFullYear()} ByG Ingeniería. Portal de Inventario.</div>
      </footer>

      {/* MODAL DE EDICIÓN / CREACIÓN */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px] border-t-8 border-t-[#D32F2F] p-8">
          <DialogHeader><DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">{editingProduct ? "Editar Especificaciones" : "Registrar Nuevo Material"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 pt-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2"><Label className="text-xs font-bold uppercase text-slate-500">Código de Referencia</Label><Input value={formData.codigoProducto} onChange={(e) => setFormData({...formData, codigoProducto: e.target.value})} required className="h-11 bg-slate-50 border-slate-200" /></div>
              <div className="space-y-2"><Label className="text-xs font-bold uppercase text-slate-500">Nombre / Descripción</Label><Input value={formData.nombreProducto} onChange={(e) => setFormData({...formData, nombreProducto: e.target.value})} required className="h-11 bg-slate-50 border-slate-200" /></div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2"><Label className="text-xs font-bold uppercase text-[#D32F2F]">Stock en Bodega</Label><Input type="number" value={formData.cantidad} onChange={(e) => setFormData({...formData, cantidad: parseInt(e.target.value) || 0})} required className="h-11 bg-red-50 border-red-200 text-red-900 font-black text-lg" /></div>
              <div className="space-y-2"><Label className="text-xs font-bold uppercase text-slate-500">Unidad (Caja/Par)</Label><Input value={formData.formato} onChange={(e) => setFormData({...formData, formato: e.target.value})} className="h-11 bg-slate-50" /></div>
              <div className="space-y-2"><Label className="text-xs font-bold uppercase text-slate-500">Talla / Medida</Label><Input value={formData.tallaMedida} onChange={(e) => setFormData({...formData, tallaMedida: e.target.value})} className="h-11 bg-slate-50" /></div>
            </div>
            <div className="space-y-2"><Label className="text-xs font-bold uppercase text-slate-500">Ubicación Física (Pasillo / Estante)</Label><Input value={formData.ubicacion} onChange={(e) => setFormData({...formData, ubicacion: e.target.value})} className="h-11 bg-slate-50 border-slate-200" /></div>
            <div className="pt-6 border-t flex gap-4 justify-end">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-12 px-6">Cancelar</Button>
              <Button type="submit" disabled={guardando} className="bg-[#D32F2F] hover:bg-red-700 font-extrabold h-12 px-8 gap-2 shadow-lg shadow-red-100">
                {guardando ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />} 
                {editingProduct ? "Actualizar Material" : "Guardar Registro"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL PERSONALIZADO PARA CONFIRMAR BORRADO */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[450px] border-t-8 border-t-red-600 p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <AlertTriangle className="h-7 w-7 text-red-600" /> Confirmar Acción
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-600 text-base leading-relaxed">
              ¿Estás seguro de que deseas eliminar este material del catálogo?
              <br /><br />
              <span className="font-bold text-red-600">Esta acción no se puede deshacer</span> y podría afectar a los pedidos que ya contienen este producto.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
            <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)} className="font-bold h-11 px-6">
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete} 
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 font-bold gap-2 h-11 px-6 shadow-lg shadow-red-100"
            >
              {deleting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
              Sí, Eliminar Material
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}