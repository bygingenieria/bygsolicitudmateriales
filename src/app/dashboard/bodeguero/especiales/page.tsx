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
import { PackagePlus, Send, XCircle, ArrowLeft, Loader2, Trash2 } from "lucide-react";

export default function PanelEspecialesPage() {
  const [solicitudes, setSolicitudes] = useState<SolicitudResumen[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarDatos = async () => {
    try {
      const data = await solicitudesService.getEspeciales();
      setSolicitudes(data);
    } catch {
      toast.error("Error al cargar");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const eliminarPedido = async (id: number, folio: number) => {
    if (!confirm(`¿Eliminar definitivamente el pedido especial #${folio}?`)) return;
    try {
      await solicitudesService.delete(id);
      toast.success("Eliminado");
      cargarDatos();
    } catch {
      toast.error("Error al borrar");
    }
  };

  const procesarSolicitud = async (id: number, estado: string) => {
    try {
      await solicitudesService.updateEstado(id, estado);
      toast.success("Acción realizada");
      cargarDatos();
    } catch {
      toast.error("Error al procesar");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 pt-32 font-sans">
      <div className="container mx-auto max-w-6xl space-y-6">
        <div className="flex justify-between items-center border-b border-orange-200 pb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/bodeguero"><Button variant="outline" size="icon" className="rounded-full border-orange-200"><ArrowLeft className="w-5 h-5 text-orange-600" /></Button></Link>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3"><PackagePlus className="w-8 h-8 text-orange-600" /> Solicitudes Especiales</h1>
          </div>
        </div>

        <Card className="shadow-2xl border-0 overflow-hidden bg-white border-t-4 border-t-orange-500">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-orange-50/50">
                <TableRow>
                  <TableHead className="font-bold pl-6">Folio</TableHead>
                  <TableHead className="font-bold">Tipo</TableHead>
                  <TableHead className="font-bold">Solicitante</TableHead>
                  <TableHead className="text-right pr-6 font-bold">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cargando ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin mx-auto text-orange-500" /></TableCell></TableRow>
                ) : solicitudes.map((s) => (
                  <TableRow key={s.id} className="hover:bg-orange-50/30">
                    <TableCell className="font-bold text-orange-600 pl-6">#{s.folio}</TableCell>
                    <TableCell><Badge className="bg-orange-100 text-orange-700 text-[10px]">{s.tipoPedido}</Badge></TableCell>
                    <TableCell className="font-medium">{s.solicitante}</TableCell>
                    <TableCell className="text-right pr-6 space-x-2">
                      {s.estado === "Pendiente" && (
                        <>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8" onClick={() => procesarSolicitud(s.id, "RequiereCompra")}><Send className="w-4 h-4 mr-1" /> Aceptar</Button>
                          <Button size="sm" variant="outline" className="text-red-600 h-8" onClick={() => procesarSolicitud(s.id, "Rechazada")}><XCircle className="w-4 h-4 mr-1" /> Rechazar</Button>
                        </>
                      )}
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-red-500" onClick={() => eliminarPedido(s.id, s.folio)} title="Eliminar del historial"><Trash2 className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}