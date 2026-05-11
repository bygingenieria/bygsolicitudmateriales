export interface SolicitudResumen {
  id: number;
  folio: number;
  solicitanteId: string;
  solicitante: string;
  ordenCompra: string;
  proyecto: string;
  estado: string;
  fechaCreacion: string;
  fechaFinalizacion?: string;
  totalItems: number;
  tipoPedido?: string;
}

export interface DetalleSolicitudDto {
  productoId: number | null;
  cantidad: number;
  temporalNombre: string | null;
  temporalCodigo: string | null;
  temporalUnidad: string | null;
  temporalTalla: string | null;
  observacion: string | null;
}

export interface CreateSolicitudDto {
  proyecto: string;
  observaciones?: string;
  tipoPedido: string;
  detalles: DetalleSolicitudDto[];
}

export interface DetalleResponseDto {
  id: number;
  nombreMaterial: string;
  codigo: string;
  unidad: string;
  talla: string;
  observacion?: string;
  cantidadSolicitada: number;
  cantidadAprobada: number;
  esManual: boolean;
}

export interface SolicitudDetalle extends SolicitudResumen {
  items: DetalleResponseDto[];
  observaciones?: string; // ✅ Añadido para mostrar justificación
}

export interface UpdateEstadoDto {
  nuevoEstado: string;
}