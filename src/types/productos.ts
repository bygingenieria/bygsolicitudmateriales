export interface Bodega {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface Producto {
  id: number;
  codigoProducto: string;
  nombreProducto: string;
  ubicacion?: string;
  tallaMedida?: string;
  formato?: string;
  cantidad: number;
  observacion?: string;
  activo: boolean;
  bodegaId: number;
  bodega?: Bodega;
  creadoEn?: string;
}

export interface CreateUpdateProductoDto {
  codigoProducto: string;
  nombreProducto: string;
  ubicacion: string;
  tallaMedida: string;
  formato: string;
  cantidad: number;
  observacion: string;
  bodegaId: number;
  activo: boolean;
}