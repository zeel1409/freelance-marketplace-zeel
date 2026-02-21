// Centralized API client — all requests go through the backend
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const getToken = (): string | null => localStorage.getItem('freelancehub_token');

const setToken = (token: string): void => localStorage.setItem('freelancehub_token', token);
const clearToken = (): void => localStorage.removeItem('freelancehub_token');

async function request<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data as T;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
    register: (body: { email: string; password: string; full_name: string; role: 'client' | 'freelancer' }) =>
        request<{ token: string; user: UserProfile }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    login: (body: { email: string; password: string }) =>
        request<{ token: string; user: UserProfile }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    me: () => request<{ user: UserProfile }>('/auth/me'),
};

// ─── Gigs ─────────────────────────────────────────────────────────────────────
export const gigsApi = {
    list: (params?: { search?: string; category?: string; freelancer?: string }) => {
        const qs = new URLSearchParams();
        if (params?.search) qs.set('search', params.search);
        if (params?.category) qs.set('category', params.category);
        if (params?.freelancer) qs.set('freelancer', params.freelancer);
        const query = qs.toString() ? `?${qs.toString()}` : '';
        return request<{ gigs: Gig[] }>(`/gigs${query}`);
    },

    get: (id: string) => request<{ gig: Gig & { reviews: Review[] } }>(`/gigs/${id}`),

    create: (body: { title: string; description: string; category: string; price: string; delivery_days: string; image_url?: string }) =>
        request<{ gig: Gig }>('/gigs', { method: 'POST', body: JSON.stringify(body) }),

    update: (id: string, body: Partial<{ title: string; description: string; category: string; price: number; delivery_days: number; image_url: string; status: string }>) =>
        request<{ gig: Gig }>(`/gigs/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

    delete: (id: string) =>
        request<{ message: string }>(`/gigs/${id}`, { method: 'DELETE' }),
};

// ─── Orders ───────────────────────────────────────────────────────────────────
export const ordersApi = {
    list: () => request<{ orders: Order[] }>('/orders'),

    create: (body: { gig_id: string; requirements?: string }) =>
        request<{ order: Order }>('/orders', { method: 'POST', body: JSON.stringify(body) }),

    updateStatus: (id: string, status: string) =>
        request<{ order: Order }>(`/orders/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        }),
};

// ─── Messages ─────────────────────────────────────────────────────────────────
export const messagesApi = {
    list: (orderId: string) => request<{ messages: Message[] }>(`/messages/${orderId}`),

    send: (orderId: string, content: string) =>
        request<{ data: Message }>(`/messages/${orderId}`, {
            method: 'POST',
            body: JSON.stringify({ content }),
        }),
};

// ─── Reviews ──────────────────────────────────────────────────────────────────
export const reviewsApi = {
    create: (body: { order_id: string; rating: number; comment?: string }) =>
        request<{ review: Review }>('/reviews', { method: 'POST', body: JSON.stringify(body) }),
};

// ─── Profiles ─────────────────────────────────────────────────────────────────
export const profilesApi = {
    get: (id: string) => request<{ profile: UserProfile }>(`/profiles/${id}`),

    updateMe: (body: { full_name?: string; bio?: string; avatar_url?: string; skills?: string[] }) =>
        request<{ profile: UserProfile }>('/profiles/me', {
            method: 'PUT',
            body: JSON.stringify(body),
        }),
};

// ─── Token helpers (used by AuthContext) ─────────────────────────────────────
export { setToken, clearToken, getToken };

// ─── Shared types ─────────────────────────────────────────────────────────────
export type UserProfile = {
    id: string;
    email: string;
    full_name: string;
    role: 'client' | 'freelancer';
    avatar_url: string | null;
    bio: string | null;
    skills: string[] | null;
    created_at?: string;
    updated_at?: string;
};

export type Gig = {
    id: string;
    freelancer_id: string;
    title: string;
    description: string;
    category: string;
    price: number;
    delivery_days: number;
    image_url: string | null;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
    profiles?: UserProfile;
    reviews?: Review[];
};

export type Order = {
    id: string;
    gig_id: string;
    client_id: string;
    freelancer_id: string;
    status: 'pending' | 'in_progress' | 'delivered' | 'completed' | 'cancelled';
    price: number;
    requirements: string | null;
    delivery_date: string | null;
    created_at: string;
    updated_at: string;
    gigs?: Gig;
    client?: UserProfile;
    freelancer?: UserProfile;
};

export type Message = {
    id: string;
    order_id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    is_read: boolean;
    created_at: string;
    sender?: UserProfile;
};

export type Review = {
    id: string;
    order_id: string;
    gig_id: string;
    client_id: string;
    freelancer_id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    client?: UserProfile;
};
