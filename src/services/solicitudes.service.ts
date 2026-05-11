import { api } from "@/lib/axios";
import { SolicitudResumen, SolicitudDetalle, UpdateEstadoDto, CreateSolicitudDto } from "@/types/solicitudes";

export const solicitudesService = {
  getAllBodega: async (): Promise<SolicitudResumen[]> => {
    const { data } = await api.get<SolicitudResumen[]>("/solicitudes/bodega/todas");
    return data;
  },
  getEspeciales: async (): Promise<SolicitudResumen[]> => {
    const { data } = await api.get<SolicitudResumen[]>("/solicitudes/bodega/especiales");
    return data;
  },
  getById: async (id: number): Promise<SolicitudDetalle> => {
    const { data } = await api.get<SolicitudDetalle>(`/solicitudes/${id}`);
    return data;
  },
  updateEstado: async (id: number, estado: string): Promise<void> => {
    const payload: UpdateEstadoDto = { nuevoEstado: estado };
    await api.patch(`/solicitudes/${id}/estado`, payload);
  },
  create: async (payload: CreateSolicitudDto) => {
    const { data } = await api.post("/solicitudes", payload);
    return data;
  },
  // ✅ NUEVO: MÉTODO DELETE
  delete: async (id: number): Promise<void> => {
    await api.delete(`/solicitudes/${id}`);
  },
};