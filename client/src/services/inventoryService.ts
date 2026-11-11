import { api } from './api';
import { SupplierListing, CanonicalEntity, ComparisonOffer } from '../types';

export const inventoryService = {
  async getRawListings(params?: {
    category?: string;
    supplierId?: string;
    matchStatus?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: SupplierListing[]; pagination: any }> {
    const res = await api.get('/inventory', { params });
    return res.data;
  },

  async getCanonicalEntities(params?: {
    category?: string;
    city?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: CanonicalEntity[]; pagination: any }> {
    const res = await api.get('/entities', { params });
    return res.data;
  },

  async getCanonicalEntityById(id: string): Promise<CanonicalEntity> {
    const res = await api.get(`/entities/${id}`);
    return res.data.data;
  },

  async getOfferComparison(canonicalEntityId: string): Promise<{
    entity: Partial<CanonicalEntity>;
    offers: ComparisonOffer[];
  }> {
    const res = await api.get('/offers/compare', { params: { canonicalEntityId } });
    return res.data.data;
  },
};
