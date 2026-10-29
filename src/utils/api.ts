import {
  Product,
  Order,
  Customer,
  ShopSettings,
  MessengerConfig,
  MessengerMessageLog,
  DashboardStats,
} from '../types';

const TOKEN_KEY = 'lao_smart_seller_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່' }));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (credentials: { username: string; password: string }) =>
    request<{ success: boolean; token: string; admin: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  getMe: () => request<{ authenticated: boolean; admin?: any }>('/api/auth/me'),
  logout: () =>
    request<{ success: boolean }>('/api/auth/logout', {
      method: 'POST',
    }),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    request<{ success: boolean; message: string }>('/api/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Dashboard
  getDashboardStats: () => request<DashboardStats>('/api/dashboard/stats'),
  getSalesReport: () => request<any>('/api/reports/sales'),

  // Products
  getProducts: (params?: { category?: string; search?: string; lowStock?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.lowStock) query.append('lowStock', 'true');
    const qs = query.toString();
    return request<Product[]>(`/api/products${qs ? `?${qs}` : ''}`);
  },
  createProduct: (product: Partial<Product>) =>
    request<Product>('/api/products', {
      method: 'POST',
      body: JSON.stringify(product),
    }),
  updateProduct: (id: string, updates: Partial<Product>) =>
    request<Product>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  deleteProduct: (id: string) =>
    request<{ success: boolean }>(`/api/products/${id}`, {
      method: 'DELETE',
    }),

  // Orders
  getOrders: (params?: { paymentStatus?: string; deliveryStatus?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.paymentStatus) query.append('paymentStatus', params.paymentStatus);
    if (params?.deliveryStatus) query.append('deliveryStatus', params.deliveryStatus);
    if (params?.search) query.append('search', params.search);
    const qs = query.toString();
    return request<Order[]>(`/api/orders${qs ? `?${qs}` : ''}`);
  },
  createOrder: (order: Partial<Order>) =>
    request<Order>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    }),
  updateOrder: (id: string, updates: Partial<Order>) =>
    request<Order>(`/api/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  deleteOrder: (id: string) =>
    request<{ success: boolean }>(`/api/orders/${id}`, {
      method: 'DELETE',
    }),

  // Customers
  getCustomers: () => request<Customer[]>('/api/customers'),
  updateCustomer: (id: string, updates: Partial<Customer>) =>
    request<Customer>(`/api/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  // Settings
  getSettings: () => request<ShopSettings>('/api/settings'),
  updateSettings: (settings: Partial<ShopSettings>) =>
    request<ShopSettings>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  // Messenger
  getMessengerConfig: () =>
    request<
      MessengerConfig & {
        webhookUrl: string;
        hasPageAccessToken: boolean;
        hasAppSecret: boolean;
      }
    >('/api/messenger/config'),
  updateMessengerConfig: (config: Partial<MessengerConfig>) =>
    request<{ success: boolean; config: MessengerConfig }>('/api/messenger/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    }),
  simulateMessenger: (data: { messageText: string; senderName?: string }) =>
    request<{
      success: boolean;
      userMessage: string;
      replyText: string;
      replyType: 'ai' | 'rule';
      log: MessengerMessageLog;
    }>('/api/messenger/simulate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMessengerLogs: () => request<MessengerMessageLog[]>('/api/messenger/logs'),
};
