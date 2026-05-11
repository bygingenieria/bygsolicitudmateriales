"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ShoppingBag,
  ArrowLeft,
  Loader2,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  AlertCircle,
  FileText,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import { solicitudesService } from "@/services/solicitudes.service";
import { SolicitudResumen, SolicitudDetalle } from "@/types/solicitudes";

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
    case "Finalizada":
      return <CheckCircle2 className="w-3 h-3 mr-1" />;
    case "Rechazada":
      return <XCircle className="w-3 h-3 mr-1" />;
    default:
      return <Package className="w-3 h-3 mr-1" />;
  }
};

export default function MisPedidosPage() {
  const router = useRouter();
  const [solicitudes, setSolicitudes] = useState<SolicitudResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSolicitud, setSelectedSolicitud] =
    useState<SolicitudDetalle | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchMisSolicitudes = async () => {
    try {
      // ✅ CORREGIDO: Llama a getMine() en lugar de getAllBodega()
      const data = await solicitudesService.getMine();
      setSolicitudes(data);
    } catch {
      toast.error("Error al cargar tus pedidos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMisSolicitudes();
  }, []);

  const handleOpenDetail = async (id: number) => {
    setLoadingDetail(true);
    setSelectedSolicitud(null);
    try {
      const detail = await solicitudesService.getById(id);
      setSelectedSolicitud(detail);
    } catch {
      toast.error("Error al cargar el detalle");
    } finally {
      setLoadingDetail(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-[#D32F2F]" />
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 p-8 pt-24 font-sans text-slate-900">
      <div className="container mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-3">
              <ShoppingBag className="h-8 w-8 text-[#D32F2F]" /> Mis Pedidos
            </h1>
            <p className="text-slate-500 mt-1">
              Revisa el historial y estado de tus requerimientos.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio
          </Button>
        </div>

        <Card className="border-t-4 border-t-[#D32F2F] shadow-lg bg-white">
          <CardHeader>
            <CardTitle>Historial de Solicitudes</CardTitle>
            <CardDescription>
              Consulta el progreso de tus materiales solicitados.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-slate-500 bg-slate-50 border-b uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4 font-bold">Folio</th>
                    <th className="px-6 py-4 font-bold">Proyecto / Obra</th>
                    <th className="px-6 py-4 font-bold">Fecha</th>
                    <th className="px-6 py-4 font-bold text-center">Estado</th>
                    <th className="px-6 py-4 font-bold text-center">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {solicitudes.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold">#{s.folio}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold">{s.proyecto}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(s.fechaCreacion).toLocaleDateString("es-CL")}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge
                          className={`${getStatusBadge(s.estado)} text-white border-0`}
                        >
                          {getStatusIcon(s.estado)} {s.estado}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[#D32F2F] hover:bg-red-50 gap-2"
                              onClick={() => handleOpenDetail(s.id)}
                            >
                              <Eye className="w-4 h-4" /> Ver {s.totalItems}{" "}
                              Items
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl bg-white text-slate-900">
                            <DialogHeader>
                              <DialogTitle>
                                Detalle del Pedido #{s.folio}
                              </DialogTitle>
                            </DialogHeader>

                            {loadingDetail ? (
                              <div className="py-12 flex justify-center">
                                <Loader2 className="animate-spin h-8 w-8 text-[#D32F2F]" />
                              </div>
                            ) : selectedSolicitud ? (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-3 rounded-lg border border-slate-200">
                                  <div>
                                    <span className="text-slate-500">
                                      Proyecto:
                                    </span>{" "}
                                    <span className="font-medium">
                                      {selectedSolicitud.proyecto}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-slate-500">
                                      Estado Actual:
                                    </span>{" "}
                                    <span className="font-medium">
                                      {selectedSolicitud.estado}
                                    </span>
                                  </div>
                                </div>

                                {/* ✅ CAMBIO: Muestra la justificación solo si existe */}
                                {selectedSolicitud.observaciones &&
                                  selectedSolicitud.observaciones.trim() !==
                                    "" && (
                                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                      <Label className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1 block">
                                        Tu Justificación
                                      </Label>
                                      <p className="text-sm text-slate-700 italic">
                                        &quot;{selectedSolicitud.observaciones}
                                        &quot;
                                      </p>
                                    </div>
                                  )}

                                <div className="border rounded-md overflow-hidden border-slate-200">
                                  <table className="w-full text-sm">
                                    <thead className="bg-slate-100 text-slate-600">
                                      <tr>
                                        <th className="px-3 py-2 text-left">
                                          Material
                                        </th>
                                        <th className="px-3 py-2 text-center">
                                          Cant.
                                        </th>
                                        <th className="px-3 py-2 text-center">
                                          Código
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                      {selectedSolicitud.items.map((item) => (
                                        <tr
                                          key={item.id}
                                          className={
                                            item.esManual
                                              ? "bg-orange-50/30"
                                              : "bg-white"
                                          }
                                        >
                                          <td className="px-3 py-2 font-medium">
                                            {item.nombreMaterial}
                                            {item.esManual && (
                                              <p className="text-[10px] text-orange-600 font-normal">
                                                Material ingresado manualmente
                                              </p>
                                            )}
                                          </td>
                                          <td className="px-3 py-2 text-center font-bold">
                                            {item.cantidadSolicitada}
                                          </td>
                                          <td className="px-3 py-2 text-center text-xs font-mono">
                                            {item.codigo}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            ) : (
                              <p className="text-center text-red-500">
                                Error al cargar datos.
                              </p>
                            )}
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  ))}
                  {solicitudes.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-12 text-slate-400"
                      >
                        <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        Aún no has realizado ninguna solicitud.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
