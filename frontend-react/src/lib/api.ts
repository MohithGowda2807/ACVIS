const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

async function request(endpoint: string, options: RequestInit = {}) {
  const token = JSON.parse(localStorage.getItem('acvis-auth-storage') || '{}')?.state?.token;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const res = await fetch(`${API_BASE}${normalizedEndpoint}`, { ...options, headers });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.detail || `Request failed: ${res.status}`);
  return data;
}

export const api = {
  register: (email: string, password: string, role: string) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, role }) }),

  login: (email: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  analyze: (reviews: any[], use_csv?: boolean) =>
    request('/analyze', { method: 'POST', body: JSON.stringify({ reviews, use_csv: use_csv || false }) }),

  getInsights: () => request('/insights'),
  getFeatures: () => request('/features'),
  getAlerts: () => request('/alerts'),
  getActions: () => request('/actions'),
  getTrends: () => request('/trends'),
  getRevenue: () => request('/revenue'),
  getStats: () => request('/stats'),
  getHealth: () => request('/health'),
  getMe: () => request('/auth/me'),
  chatUser: (message: string) => request('/chat/user', { method: 'POST', body: JSON.stringify({ message }) }),
  chatCompany: (message: string) => request('/chat/company', { method: 'POST', body: JSON.stringify({ message }) }),

  // Tickets
  createTicket: (subject: string, description: string, category: string) =>
    request('/tickets', { method: 'POST', body: JSON.stringify({ subject, description, category }) }),
  getTickets: () => request('/tickets'),
  getTicket: (ticket_id: string) => request(`/tickets/${ticket_id}`),
  resolveTicket: (ticket_id: string, resolution_note: string) =>
    request(`/tickets/${ticket_id}/resolve`, { method: 'PATCH', body: JSON.stringify({ resolution_note }) }),
};
