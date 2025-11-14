import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface HourBalance {
  balance: number;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'EXPIRED';
  validUntil?: string;
}

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
};

export const hourBalanceService = {
  getBalance: async (): Promise<HourBalance> => {
    const response = await api.get('/hour-balance/me');
    return response.data;
  },
  getHistory: async () => {
    const response = await api.get('/hour-balance/me/history');
    return response.data;
  },
};

export const dashboardService = {
  getEmployeeDashboard: async () => {
    const response = await api.get('/dashboard/employee');
    return response.data;
  },
  getManagerDashboard: async () => {
    const response = await api.get('/dashboard/manager');
    return response.data;
  },
};

export const compensationService = {
  create: async (data: { requestedHours: number; compensationDate: string; reason?: string }) => {
    const response = await api.post('/compensation', data);
    return response.data;
  },
  list: async (status?: string) => {
    const response = await api.get('/compensation', { params: { status } });
    return response.data;
  },
};

export const timeClockService = {
  import: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/time-clock/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  list: async (params?: { userId?: string; startDate?: string; endDate?: string }) => {
    const response = await api.get('/time-clock', { params });
    return response.data;
  },
};

export const usersService = {
  list: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  get: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/users', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

export const rulesService = {
  list: async (active?: boolean) => {
    const response = await api.get('/rules', { params: { active } });
    return response.data;
  },
  get: async (id: string) => {
    const response = await api.get(`/rules/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/rules', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/rules/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/rules/${id}`);
    return response.data;
  },
  simulate: async (data: any) => {
    const response = await api.post('/rules/simulate', data);
    return response.data;
  },
};

export const adminDashboardService = {
  get: async () => {
    const response = await api.get('/dashboard/admin');
    return response.data;
  },
};


