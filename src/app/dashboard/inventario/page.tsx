"use client";

import { useEffect, useState } from "react";
import { Producto, CreateUpdateProductoDto } from "@/types/productos";
import { productosService } from "@/services/productos.service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Save, Package, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function InventarioPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productosFiltrados, setProductosFiltrados] = useState<Producto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [guardando, setGuardando] = useState<boolean>(false);

  // Estado tipado para el formulario
  const [formData, setFormData] = useState<CreateUpdateProductoDto>({
    nombreProducto: "",
    codigoProducto: "",
    cantidad: 0,
    formato: "",
    tallaMedida: "",
    ubicacion: "",
    observacion: "",
    bodegaId: 1, 
    activo: true
  });

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const data = await productosService.getAll();
      setProductos(data);
      setProductosFiltrados(data);
    } catch (error: unknown) {
      toast.error("Error al cargar inventario");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  // Efecto para la barra de búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setProductosFiltrados(productos);
    } else {
      const lower = searchTerm.toLowerCase();
      const filtrados = productos.filter(p => 
        p.nombreProducto.toLowerCase().includes(lower) || 
        p.codigoProducto.toLowerCase().includes(lower)
      );
      setProductosFiltrados(filtrados);
    }
  }, [searchTerm, productos]);

  const handleOpenDialog = (producto: Producto | null = null) => {
    if (producto) {
      setEditingProduct(producto);
      setFormData({
        nombreProducto: producto.nombreProducto,
        codigoProducto: producto.codigoProducto,
        cantidad: producto.cantidad,
        formato: producto.formato || "",
        tallaMedida: producto.tallaMedida || "",
        ubicacion: producto.ubicacion || "",
        observacion: producto.observacion || "",
        bodegaId: producto.bodegaId,
        activo: producto.activo
      });
    } else {
      setEditingProduct(null);
      setFormData({
        nombreProducto: "",
        codigoProducto: "",
        cantidad: 0,
        formato: "",
        tallaMedida: "",
        ubicacion: "",
        observacion: "",
        bodegaId: 1,
        activo: true
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGuardando(true);
    try {
      if (editingProduct) {
        await productosService.update(editingProduct.id, formData);
        toast.success("Producto actualizado correctamente");
      } else {
        await productosService.create(formData);
        toast.success("Producto creado exitosamente");
      }
      setIsDialogOpen(false);
      fetchProductos();
    } catch (error: unknown) {
      toast.error("Error al guardar cambios");
    } finally {
      setGuardando(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Estás seguro de eliminar este material del sistema?")) return;
    try {
      await productosService.delete(id);
      toast.success("Producto eliminado");
      fetchProductos();
    } catch (error: unknown) {
      toast.error("No se pudo eliminar el producto");
    }
  };

  const updateStockQuickly = async (id: number, delta: number) => {
    const prod = productos.find(p => p.id === id);
    if (!prod) return;
    
    const nuevaCantidad = Math.max(0, prod.cantidad + delta);
    
    try {
      // Actualizamos UI instantáneamente para mejor experiencia
      setProductos(productos.map(p => p.id === id ? { ...p, cantidad: nuevaCantidad } : p));
      setProductosFiltrados(productosFiltrados.map(p => p.id === id ? { ...p, cantidad: nuevaCantidad } : p));
      
      await productosService.updateStock(id, nuevaCantidad);
    } catch (error: unknown) {
      toast.error("Error al actualizar el stock en la base de datos");
      // Revertimos si falla
      fetchProductos(); 
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => window.history.back()} className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">Inventario de Materiales</h1>
            <p className="text-slate-500">Gestión total del catálogo y existencias en bodega.</p>
          </div>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Nuevo Material
        </Button>
      </div>

      <Card className="border-t-4 border-t-blue-600 shadow-md">
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Catálogo
          </CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Buscar material..." 
              className="pl-9 h-9" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="pt-4 p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin mb-2 text-blue-600" />
              <p>Cargando inventario...</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="pl-6">Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Unidad</TableHead>
                  <TableHead className="text-center">Stock Físico</TableHead>
                  <TableHead className="text-right pr-6">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      No se encontraron productos registrados.
                    </TableCell>
                  </TableRow>
                ) : (
                  productosFiltrados.map((producto) => (
                    <TableRow key={producto.id} className="hover:bg-slate-50/50">
                      <TableCell className="pl-6 font-mono text-xs font-semibold text-slate-600">
                        {producto.codigoProducto}
                      </TableCell>
                      <TableCell className="font-bold text-slate-800">
                        {producto.nombreProducto}
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {producto.ubicacion || "---"}
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {producto.formato || "---"}
                        {producto.tallaMedida ? ` (${producto.tallaMedida})` : ""}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            size="icon" 
                            variant="outline" 
                            className="h-7 w-7 text-slate-500 hover:text-red-600" 
                            onClick={() => updateStockQuickly(producto.id, -1)}
                          >
                            -
                          </Button>
                          <span className={`w-12 text-center text-lg font-black ${producto.cantidad <= 0 ? "text-red-500" : producto.cantidad < 5 ? "text-orange-500" : "text-green-600"}`}>
                            {producto.cantidad}
                          </span>
                          <Button 
                            size="icon" 
                            variant="outline" 
                            className="h-7 w-7 text-slate-500 hover:text-green-600" 
                            onClick={() => updateStockQuickly(producto.id, 1)}
                          >
                            +
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button size="icon" variant="ghost" className="text-blue-600 hover:bg-blue-50" onClick={() => handleOpenDialog(producto)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(producto.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl text-blue-700">
              {editingProduct ? "Editar Material" : "Registrar Nuevo Material"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold">Código del Producto *</Label>
                <Input 
                  value={formData.codigoProducto} 
                  onChange={(e) => setFormData({...formData, codigoProducto: e.target.value})} 
                  placeholder="Ej: MTR-001"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Nombre del Producto *</Label>
                <Input 
                  value={formData.nombreProducto} 
                  onChange={(e) => setFormData({...formData, nombreProducto: e.target.value})} 
                  placeholder="Ej: Disco de Corte 7''"
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="font-bold">Stock Físico *</Label>
                <Input 
                  type="number" 
                  min="0"
                  className="font-bold text-lg"
                  value={formData.cantidad} 
                  onChange={(e) => setFormData({...formData, cantidad: parseInt(e.target.value) || 0})} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Unidad / Formato</Label>
                <Input 
                  placeholder="Ej: Unidad, Par, Caja" 
                  value={formData.formato} 
                  onChange={(e) => setFormData({...formData, formato: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Talla / Medida</Label>
                <Input 
                  placeholder="Ej: L, 10mm, 7''" 
                  value={formData.tallaMedida} 
                  onChange={(e) => setFormData({...formData, tallaMedida: e.target.value})} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold">Ubicación Físico en Bodega</Label>
              <Input 
                placeholder="Ej: Pasillo A, Estante 3" 
                value={formData.ubicacion} 
                onChange={(e) => setFormData({...formData, ubicacion: e.target.value})} 
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold">Observaciones Adicionales</Label>
              <Input 
                placeholder="Marca preferida, advertencias de uso, etc." 
                value={formData.observacion} 
                onChange={(e) => setFormData({...formData, observacion: e.target.value})} 
              />
            </div>

            <div className="pt-4 flex gap-3 justify-end border-t mt-6">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={guardando} className="gap-2 bg-blue-600 hover:bg-blue-700">
                {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {editingProduct ? "Actualizar" : "Guardar Producto"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}