import { api } from './api';
import { AnalyticsOverview } from '../types';

export const analyticsService = {
  async getOverview(): Promise<AnalyticsOverview> {
    const res = await api.get('/analytics/overview');
    return res.data.data;
  },
};
