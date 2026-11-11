import { api } from './api';
import { User } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await api.post('/auth/login', { email, password });
    return res.data.data;
  },

  async register(data: { email: string; password: string; name: string; role?: string }): Promise<{ user: User; token: string }> {
    const res = await api.post('/auth/register', data);
    return res.data.data;
  },

  async me(): Promise<User> {
    const res = await api.get('/auth/me');
    return res.data.data;
  },
};
