import { api } from "@/lib/axios";
import { 
  SolicitudResumen, 
  SolicitudDetalle, 
  UpdateEstadoDto, 
  CreateSolicitudDto 
} from "@/types/solicitudes";

export const solicitudesService = {
  // Panel para Bodegueros/Admins
  getAllBodega: async (): Promise<SolicitudResumen[]> => {
    const { data } = await api.get<SolicitudResumen[]>("/solicitudes/bodega/todas");
    return data;
  },

  // ✅ CORREGIDO: Ruta exacta al endpoint del backend
  getMine: async (): Promise<SolicitudResumen[]> => {
    const { data } = await api.get<SolicitudResumen[]>("/Solicitudes/mis-solicitudes");
    return data;
  },

  getById: async (id: number): Promise<SolicitudDetalle> => {
    const { data } = await api.get<SolicitudDetalle>(`/Solicitudes/${id}`);
    return data;
  },

  updateEstado: async (id: number, estado: string): Promise<void> => {
    const payload: UpdateEstadoDto = { nuevoEstado: estado };
    await api.patch(`/Solicitudes/${id}/estado`, payload);
  },

  create: async (payload: CreateSolicitudDto) => {
    const { data } = await api.post("/Solicitudes", payload);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/Solicitudes/${id}`);
  },
};