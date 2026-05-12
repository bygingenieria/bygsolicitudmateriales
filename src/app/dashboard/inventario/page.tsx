"use client";

import { useEffect, useState } from "react";
import { Producto } from "@/types/productos";
import { productosService } from "@/services/productos.service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Save, Package } from "lucide-react";
import { toast } from "sonner";

export default function InventarioPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombreProducto: "",
    codigoProducto: "",
    cantidad: 0,
    formato: "",
    tallaMedida: "",
    ubicacion: "",
    bodegaId: 1, // Por defecto la primera bodega
  });

  const fetchProductos = async () => {
    try {
      const data = await productosService.getAll();
      setProductos(data);
    } catch (error) {
      toast.error("Error al cargar inventario");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

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
        bodegaId: producto.bodegaId,
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
        bodegaId: 1,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productosService.update(editingProduct.id, formData);
        toast.success("Producto actualizado");
      } else {
        await productosService.create(formData);
        toast.success("Producto creado");
      }
      setIsDialogOpen(false);
      fetchProductos();
    } catch (error) {
      toast.error("Error al guardar cambios");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este material del sistema?")) return;
    try {
      await productosService.delete(id);
      toast.success("Eliminado");
      fetchProductos();
    } catch (error) {
      toast.error("No se pudo eliminar");
    }
  };

  const updateStockQuickly = async (id: number, delta: number) => {
    const prod = productos.find(p => p.id === id);
    if (!prod) return;
    const nuevaCantidad = Math.max(0, prod.cantidad + delta);
    try {
      await productosService.updateStock(id, nuevaCantidad);
      setProductos(productos.map(p => p.id === id ? { ...p, cantidad: nuevaCantidad } : p));
    } catch (error) {
      toast.error("Error al actualizar stock");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventario de Materiales</h1>
          <p className="text-muted-foreground">Gestión total de stock y catálogo de productos.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="h-4 w-4" /> Nuevo Producto
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead className="text-center">Stock Actual</TableHead>
                <TableHead>Unidad</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productos.map((producto) => (
                <TableRow key={producto.id}>
                  <TableCell className="font-mono text-xs">{producto.codigoProducto}</TableCell>
                  <TableCell className="font-medium">{producto.nombreProducto}</TableCell>
                  <TableCell>{producto.ubicacion || "---"}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateStockQuickly(producto.id, -1)}>-</Button>
                      <span className={`w-12 text-center font-bold ${producto.cantidad < 5 ? "text-red-500" : ""}`}>
                        {producto.cantidad}
                      </span>
                      <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateStockQuickly(producto.id, 1)}>+</Button>
                    </div>
                  </TableCell>
                  <TableCell>{producto.formato}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="icon" variant="ghost" onClick={() => handleOpenDialog(producto)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDelete(producto.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Código</Label>
                <Input value={formData.codigoProducto} onChange={(e) => setFormData({...formData, codigoProducto: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input value={formData.nombreProducto} onChange={(e) => setFormData({...formData, nombreProducto: e.target.value})} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Stock Inicial</Label>
                <Input type="number" value={formData.cantidad} onChange={(e) => setFormData({...formData, cantidad: parseInt(e.target.value)})} required />
              </div>
              <div className="space-y-2">
                <Label>Formato (Unidad)</Label>
                <Input placeholder="Ej: Par, Unidad, Caja" value={formData.formato} onChange={(e) => setFormData({...formData, formato: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Ubicación en Bodega</Label>
              <Input placeholder="Ej: Estante A-1" value={formData.ubicacion} onChange={(e) => setFormData({...formData, ubicacion: e.target.value})} />
            </div>
            <Button type="submit" className="w-full gap-2">
              <Save className="h-4 w-4" /> {editingProduct ? "Actualizar" : "Crear"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}