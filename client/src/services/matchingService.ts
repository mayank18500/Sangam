import { api } from './api';
import { SupplierListing } from '../types';

export const matchingService = {
  async getPendingReviews(): Promise<SupplierListing[]> {
    const res = await api.get('/matching/pending');
    return res.data.data;
  },

  async submitDecision(data: {
    sourceListingId: string;
    targetCanonicalId: string;
    decision: 'MANUAL_CONFIRM' | 'MANUAL_REJECT' | 'SPLIT';
    explanation?: Record<string, any>;
  }): Promise<any> {
    const res = await api.post('/matching/decision', data);
    return res.data;
  },

  async runMatching(sourceListingId: string): Promise<any> {
    const res = await api.post('/matching/run', { sourceListingId });
    return res.data;
  },
};
