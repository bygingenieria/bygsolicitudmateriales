import {api} from "@/lib/axios";
import { Producto, CreateUpdateProductoDto } from "@/types/productos";

export const productosService = {
  getAll: async (): Promise<Producto[]> => {
    const res = await api.get<Producto[]>("/productos");
    return res.data;
  },

  create: async (data: CreateUpdateProductoDto): Promise<Producto> => {
    const res = await api.post<Producto>("/productos", data);
    return res.data;
  },

  update: async (id: number, data: CreateUpdateProductoDto): Promise<void> => {
    await api.put(`/productos/${id}`, data);
  },

  updateStock: async (id: number, cantidad: number): Promise<void> => {
    // El backend espera un int directamente en el body
    await api.patch(`/productos/${id}/stock`, cantidad, {
      headers: { "Content-Type": "application/json" },
    });
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/productos/${id}`);
  },
};