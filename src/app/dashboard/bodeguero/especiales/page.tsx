"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { solicitudesService } from "@/services/solicitudes.service";
import { SolicitudResumen } from "@/types/solicitudes";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { PackagePlus, Send, XCircle, ArrowLeft, Loader2, AlertCircle } from "lucide-react";

export default function PanelEspecialesPage() {
  const [solicitudes, setSolicitudes] = useState<SolicitudResumen[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarDatos = async () => {
    try {
      const data = await solicitudesService.getEspeciales();
      setSolicitudes(data);
    } catch {
      toast.error("Error al cargar solicitudes especiales");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const procesarSolicitud = async (id: number, estado: string) => {
    try {
      await solicitudesService.updateEstado(id, estado);
      toast.success(estado === "RequiereCompra" ? "Solicitud aprobada y enviada a Compras" : "Solicitud Rechazada");
      cargarDatos();
    } catch {
      toast.error("No se pudo procesar la acción");
    }
  };

  const formatearFecha = (fechaStr: string) => {
    return new Intl.DateTimeFormat('es-CL', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(new Date(fechaStr));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 pt-32 font-sans">
      <div className="container mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-orange-200 pb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/bodeguero">
              <Button variant="outline" size="icon" className="rounded-full shadow-sm border-orange-200 hover:bg-white">
                <ArrowLeft className="w-5 h-5 text-orange-600" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                <PackagePlus className="w-8 h-8 text-orange-600" /> Solicitudes Especiales
              </h1>
              <p className="text-slate-500">Evaluación de materiales Nuevos o sin Stock</p>
            </div>
          </div>
          <Badge className="bg-orange-100 text-orange-700 border-orange-200 px-4 py-1.5 text-xs font-bold animate-pulse uppercase tracking-wider">
            Filtro de Aprobación Activo
          </Badge>
        </div>

        <Card className="shadow-2xl border-0 overflow-hidden bg-white border-t-4 border-t-orange-500">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-orange-50/50">
                <TableRow>
                  <TableHead className="font-bold text-slate-700 pl-6">Folio</TableHead>
                  <TableHead className="font-bold text-slate-700">Tipo Especial</TableHead>
                  <TableHead className="font-bold text-slate-700">Solicitante</TableHead>
                  <TableHead className="font-bold text-slate-700">Proyecto</TableHead>
                  <TableHead className="font-bold text-slate-700">Fecha</TableHead>
                  <TableHead className="text-right pr-6 font-bold text-slate-700">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cargando ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin mx-auto text-orange-500" /></TableCell></TableRow>
                ) : solicitudes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-24">
                      <AlertCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-400 font-medium">No hay solicitudes especiales pendientes de filtro.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  solicitudes.map((s) => (
                    <TableRow key={s.id} className="hover:bg-orange-50/30 transition-colors">
                      <TableCell className="font-bold text-orange-600 pl-6">#{s.folio}</TableCell>
                      <TableCell>
                        {s.tipoPedido === "NUEVO" ? (
                          <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-[10px] font-bold">TOTALMENTE NUEVO</Badge>
                        ) : (
                          <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-[10px] font-bold">STOCK AGOTADO</Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-slate-700">{s.solicitante}</TableCell>
                      <TableCell className="text-slate-600 truncate max-w-[150px]">{s.proyecto}</TableCell>
                      <TableCell className="text-slate-500 text-xs">{formatearFecha(s.fechaCreacion)}</TableCell>
                      <TableCell className="text-right pr-6">
                        {s.estado === "Pendiente" ? (
                          <div className="flex justify-end gap-2">
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white font-bold shadow-md" onClick={() => procesarSolicitud(s.id, "RequiereCompra")}>
                              <Send className="w-4 h-4 mr-1.5" /> Aceptar
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 font-bold" onClick={() => procesarSolicitud(s.id, "Rechazada")}>
                              <XCircle className="w-4 h-4 mr-1.5" /> Rechazar
                            </Button>
                          </div>
                        ) : (
                          <Badge variant="secondary" className="opacity-50 uppercase text-[9px] font-bold">{s.estado}</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}