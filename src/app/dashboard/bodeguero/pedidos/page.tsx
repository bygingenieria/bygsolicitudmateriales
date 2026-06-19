"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import {
  Package,
  ArrowLeft,
  Loader2,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  FileText,
  AlertCircle,
  ShoppingCart,
  Trash2,
  AlertTriangle //  Importado para el modal
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { solicitudesService } from "@/services/solicitudes.service";
import { SolicitudResumen, SolicitudDetalle } from "@/types/solicitudes";
import { cn } from "@/lib/utils";

//  MAPEO DE COLORES
const getStatusBadge = (estado: string) => {
  switch (estado) {
    case "Pendiente":
      return "bg-yellow-500 hover:bg-yellow-600";
    case "EnRevision":
      return "bg-purple-500 hover:bg-purple-600";
    case "AprobadaBodega":
      return "bg-blue-600 hover:bg-blue-700";
    case "RequiereCompra":
        return "bg-orange-500 hover:bg-orange-600";
    case "Finalizada":
      return "bg-green-600 hover:bg-green-700";
    case "Rechazada":
      return "bg-red-600 hover:bg-red-700";
    default:
      return "bg-slate-500";
  }
};

const getStatusIcon = (estado: string) => {
  switch (estado) {
    case "Pendiente":
      return <Clock className="w-3 h-3 mr-1" />;
    case "EnRevision":
        return <Package className="w-3 h-3 mr-1" />;
    case "RequiereCompra":
        return <ShoppingCart className="w-3 h-3 mr-1" />;
    case "Finalizada":
      return <CheckCircle2 className="w-3 h-3 mr-1" />;
    case "Rechazada":
      return <XCircle className="w-3 h-3 mr-1" />;
    default:
      return <Package className="w-3 h-3 mr-1" />;
  }
};

const formatStatusName = (estado: string) => {
    switch (estado) {
        case "EnRevision": return "En Revisión";
        case "AprobadaBodega": return "Aprobada (Bodega)";
        case "RequiereCompra": return "Requiere Compra";
        case "Finalizada": return "Entregada / Finalizada";
        default: return estado;
    }
};

export default function PedidosBodegaPage() {
  const router = useRouter();
  const [solicitudes, setSolicitudes] = useState<SolicitudResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  
  // --- ESTADOS PARA MODAL DE BORRADO ---
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pedidoToDelete, setPedidoToDelete] = useState<{id: number, folio: number} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudDetalle | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchSolicitudes = async () => {
    try {
      const data = await solicitudesService.getAllBodega();
      setSolicitudes(data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast.error("Sesión expirada");
        router.push("/login");
        return;
      }
      toast.error("Error al cargar el panel");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const handleOpenDetail = async (id: number) => {
    setLoadingDetail(true);
    setSelectedSolicitud(null);
    try {
      const detail = await solicitudesService.getById(id);
      setSelectedSolicitud(detail);
    } catch (error) {
      toast.error("No se pudo cargar el detalle del pedido");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleStatusChange = async (id: number, nuevoEstado: string) => {
    setUpdatingId(id);
    try {
      await solicitudesService.updateEstado(id, nuevoEstado);
      toast.success(`Pedido actualizado a: ${formatStatusName(nuevoEstado)}`);
      fetchSolicitudes();
    } catch (error) {
      toast.error("Error al actualizar permisos o conexión.");
    } finally {
      setUpdatingId(null);
    }
  };

  //  NUEVA LÓGICA: ABRIR MODAL
  const triggerDelete = (id: number, folio: number) => {
    setPedidoToDelete({ id, folio });
    setIsDeleteDialogOpen(true);
  };

  //  NUEVA LÓGICA: EJECUTAR BORRADO DESDE MODAL
  const confirmDelete = async () => {
    if (!pedidoToDelete) return;
    
    setIsDeleting(true);
    try {
      await solicitudesService.delete(pedidoToDelete.id);
      toast.success(`Pedido #${pedidoToDelete.folio} eliminado exitosamente`);
      fetchSolicitudes(); // Recargar la lista
      setIsDeleteDialogOpen(false);
      setPedidoToDelete(null);
    } catch (error) {
      toast.error("No se pudo eliminar el pedido. Revisa tus permisos.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-[#D32F2F]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 pt-24 font-sans">
      <div className="container mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
              <Truck className="h-8 w-8 text-[#D32F2F]" />
              Panel de Bodega
            </h1>
            <p className="text-slate-500 mt-1">Administración centralizada de solicitudes de materiales.</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/dashboard/bodeguero")} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio
          </Button>
        </div>

        <Card className="border-t-4 border-t-[#D32F2F] shadow-lg">
          <CardHeader>
            <CardTitle>Solicitudes Entrantes</CardTitle>
            <CardDescription>Lista de todos los requerimientos de obra pendientes de gestión.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-slate-500 bg-slate-50 border-b uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4 font-bold">Folio</th>
                    <th className="px-6 py-4 font-bold">Solicitante / Obra</th>
                    <th className="px-6 py-4 font-bold">Fecha</th>
                    <th className="px-6 py-4 font-bold text-center">Resumen</th>
                    <th className="px-6 py-4 font-bold text-center">Estado</th>
                    <th className="px-6 py-4 font-bold text-center">Gestión</th>
                    <th className="px-6 py-4 font-bold text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {solicitudes.map((solicitud) => (
                    <tr key={solicitud.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-700">#{solicitud.folio}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{solicitud.solicitante}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <FileText className="w-3 h-3" /> {solicitud.proyecto}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(solicitud.fechaCreacion).toLocaleDateString("es-CL")}
                        <div className="text-xs text-slate-400">
                          {new Date(solicitud.fechaCreacion).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-[#D32F2F] hover:bg-red-50 gap-2 font-medium" onClick={() => handleOpenDetail(solicitud.id)}>
                              <Eye className="w-4 h-4" /> {solicitud.totalItems} Items
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl bg-white">
                            <DialogHeader>
                              <DialogTitle className="flex justify-between items-center pr-8">
                                <span>Detalle Solicitud #{solicitud.folio}</span>
                                <Badge variant="outline">{solicitud.ordenCompra}</Badge>
                              </DialogTitle>
                            </DialogHeader>
                            {loadingDetail ? (
                              <div className="py-8 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-[#D32F2F]" /></div>
                            ) : selectedSolicitud ? (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-3 rounded-lg border">
                                  <div><span className="text-slate-500">Solicitante:</span> <span className="font-medium">{selectedSolicitud.solicitante}</span></div>
                                  <div><span className="text-slate-500">Proyecto:</span> <span className="font-medium">{selectedSolicitud.proyecto}</span></div>
                                </div>
                                <div className="border rounded-md overflow-hidden">
                                  <table className="w-full text-sm">
                                    <thead className="bg-slate-100 text-slate-600">
                                      <tr>
                                        <th className="px-3 py-2 text-left">Material</th>
                                        <th className="px-3 py-2 text-center">Cant.</th>
                                        <th className="px-3 py-2 text-center">Unidad</th>
                                        <th className="px-3 py-2 text-center">Código</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                      {selectedSolicitud.items.map((item) => (
                                        <tr key={item.id} className={item.esManual ? "bg-orange-50/50" : ""}>
                                          <td className="px-3 py-2 font-medium">
                                            <div className="flex flex-col">
                                              <span className={item.esManual ? "text-orange-900" : ""}>{item.nombreMaterial}</span>
                                              {item.esManual && <span className="text-xs text-orange-600 flex items-center gap-1 mt-1 font-normal"><AlertCircle className="w-3 h-3" /> Item manual</span>}
                                            </div>
                                          </td>
                                          <td className="px-3 py-2 text-center font-bold text-base">{item.cantidadSolicitada}</td>
                                          <td className="px-3 py-2 text-center text-slate-500">{item.unidad}</td>
                                          <td className="px-3 py-2 text-center text-xs font-mono">{item.esManual ? <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">FUERA DE CATÁLOGO</Badge> : item.codigo}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            ) : <p className="text-center text-red-500">Error al cargar datos.</p>}
                          </DialogContent>
                        </Dialog>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge className={`${getStatusBadge(solicitud.estado)} text-white border-0`}>
                          {getStatusIcon(solicitud.estado)} {formatStatusName(solicitud.estado)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          {updatingId === solicitud.id ? (
                            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                          ) : (
                            <Select value={solicitud.estado} disabled={solicitud.estado === "Finalizada" || solicitud.estado === "Rechazada"} onValueChange={(val) => handleStatusChange(solicitud.id, val)}>
                              <SelectTrigger className="w-[170px] h-8 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Pendiente">Pendiente</SelectItem>
                                <SelectItem value="EnRevision">En Revisión</SelectItem>
                                <SelectItem value="AprobadaBodega">Aprobada (Lista)</SelectItem>
                                <SelectItem value="RequiereCompra">Sin Stock (A Compra)</SelectItem>
                                <SelectItem value="Finalizada">Finalizada</SelectItem>
                                <SelectItem value="Rechazada" className="text-red-600 font-bold">Rechazar</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </td>
                      {/*  CELDA DE ELIMINACIÓN CON TRIGGER DEL MODAL */}
                      <td className="px-6 py-4 text-center">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-slate-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                          onClick={() => triggerDelete(solicitud.id, solicitud.folio)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/*  MODAL PERSONALIZADO PARA CONFIRMAR BORRADO */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[450px] border-t-8 border-t-red-600 p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <AlertTriangle className="h-7 w-7 text-red-600" /> Confirmar Acción
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-600 text-base leading-relaxed">
              ¿Estás seguro de que deseas eliminar permanentemente el pedido <span className="font-bold">#{pedidoToDelete?.folio}</span>?
              <br /><br />
              <span className="font-bold text-red-600">Esta acción no se puede deshacer</span> y se perderá todo el historial vinculado.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
            <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)} className="font-bold h-11 px-6">
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete} 
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 font-bold gap-2 h-11 px-6 shadow-lg shadow-red-100"
            >
              {isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
              Sí, Eliminar Pedido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}