"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { solicitudesService } from "@/services/solicitudes.service";
import { SolicitudResumen } from "@/types/solicitudes";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Search, Eye, ArrowLeft, Loader2, Package, Trash2 } from "lucide-react";

export default function PedidosBodegaPage() {
  const [solicitudes, setSolicitudes] = useState<SolicitudResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState("");

  const cargarDatos = async () => {
    try {
      const data = await solicitudesService.getAllBodega();
      setSolicitudes(data);
    } catch {
      toast.error("Error al cargar la lista");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const eliminarPedido = async (id: number, folio: number) => {
    if (!confirm(`¿Estás seguro de eliminar el pedido #${folio}? Esta acción no se puede deshacer.`)) return;
    try {
      await solicitudesService.delete(id);
      toast.success("Pedido eliminado");
      cargarDatos();
    } catch {
      toast.error("No se pudo eliminar el pedido");
    }
  };

  const filtrados = solicitudes.filter(s => 
    s.folio.toString().includes(filtro) || s.solicitante.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-8 pt-32 font-sans">
      <div className="container mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/bodeguero"><Button variant="outline" size="icon" className="rounded-full shadow-sm"><ArrowLeft className="w-5 h-5" /></Button></Link>
            <div><h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2"><Package className="w-8 h-8 text-[#D32F2F]" /> Gestión de Pedidos</h1><p className="text-slate-500">Historial de materiales de catálogo</p></div>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input placeholder="Buscar por folio o nombre..." className="pl-10" value={filtro} onChange={(e) => setFiltro(e.target.value)} />
          </div>
        </div>

        <Card className="shadow-xl border-0 bg-white">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-bold pl-6">Folio</TableHead>
                  <TableHead className="font-bold">Solicitante</TableHead>
                  <TableHead className="font-bold">Estado</TableHead>
                  <TableHead className="text-right pr-6 font-bold">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cargando ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin mx-auto text-[#D32F2F]" /></TableCell></TableRow>
                ) : filtrados.map((s) => (
                  <TableRow key={s.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-bold text-[#D32F2F] pl-6">#{s.folio}</TableCell>
                    <TableCell className="font-medium">{s.solicitante}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{s.estado}</Badge></TableCell>
                    <TableCell className="text-right pr-6 space-x-2">
                      <Link href={`/dashboard/pedidos/${s.id}`}><Button variant="ghost" size="sm" className="text-[#D32F2F]"><Eye className="w-4 h-4 mr-1" /> Ver</Button></Link>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => eliminarPedido(s.id, s.folio)}><Trash2 className="w-4 h-4" /></Button>
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