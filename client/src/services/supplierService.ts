import { api } from './api';
import { Supplier } from '../types';

export const supplierService = {
  async getAll(): Promise<Supplier[]> {
    const res = await api.get('/suppliers');
    return res.data.data;
  },

  async getById(id: string): Promise<Supplier> {
    const res = await api.get(`/suppliers/${id}`);
    return res.data.data;
  },

  async create(data: Partial<Supplier>): Promise<Supplier> {
    const res = await api.post('/suppliers', data);
    return res.data.data;
  },
};
