const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
const TOKEN_KEY = "perpus_access_token";

export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function getApiErrorMessage(error: unknown, fallback = "Terjadi kesalahan. Silakan coba lagi.") {
  if (!(error instanceof ApiError)) {
    return error instanceof Error ? error.message : fallback;
  }

  const details = error.details;
  if (details && typeof details === "object" && "fieldErrors" in details) {
    const fieldErrors = details.fieldErrors;
    if (fieldErrors && typeof fieldErrors === "object") {
      const messages = Object.entries(fieldErrors)
        .flatMap(([field, values]) => Array.isArray(values) ? values.map((value) => `${field}: ${String(value)}`) : [])
        .filter(Boolean);
      if (messages.length) return messages.join(" ");
    }
  }

  return error.message || fallback;
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("json") ? await response.json() : await response.arrayBuffer();

  if (!response.ok) {
    if (response.status === 401) {
      clearToken();
    }

    throw new ApiError(
      typeof payload === "object" && payload && "message" in payload ? String(payload.message) : "Request gagal",
      response.status,
      typeof payload === "object" && payload && "code" in payload ? String(payload.code) : undefined,
      typeof payload === "object" && payload && "details" in payload ? payload.details : undefined,
    );
  }

  return payload as T;
}

export const api = {
  auth: {
    login: (body: { email: string; password: string }) => request<ApiEnvelope<{ token: string; user: User }>>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
    register: (body: RegisterPayload) => request<ApiEnvelope<User>>("/auth/register", { method: "POST", body: JSON.stringify(body) }),
    me: () => request<ApiEnvelope<User>>("/auth/me"),
  },
  dashboard: {
    summary: () => request<ApiEnvelope<DashboardSummary>>("/dashboard/summary"),
  },
  books: {
    list: (params: URLSearchParams) => request<ApiEnvelope<Book[]>>(`/books?${params.toString()}`),
    uploadCover: (file: File) => { const body = new FormData(); body.append("file", file); return request<ApiEnvelope<{ url: string }>>("/uploads/covers", { method: "POST", body }); },
    create: (body: BookPayload) => request<ApiEnvelope<Book>>("/books", { method: "POST", body: JSON.stringify(body) }),
    update: (id: number, body: Partial<BookPayload>) => request<ApiEnvelope<Book>>(`/books/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    remove: (id: number) => request<ApiEnvelope<{ message: string }>>(`/books/${id}`, { method: "DELETE" }),
    copies: (id: number) => request<ApiEnvelope<BookCopy[]>>(`/books/${id}/copies`),
    createCopy: (id: number, body: CopyPayload) => request<ApiEnvelope<BookCopy>>(`/books/${id}/copies`, { method: "POST", body: JSON.stringify(body) }),
    updateCopy: (id: number, body: Partial<CopyPayload>) => request<ApiEnvelope<BookCopy>>(`/book-copies/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  },
  categories: {
    list: () => request<ApiEnvelope<Category[]>>("/categories"),
    create: (body: { name: string; slug?: string }) => request<ApiEnvelope<Category>>("/categories", { method: "POST", body: JSON.stringify(body) }),
    update: (id: number, body: { name?: string; slug?: string }) => request<ApiEnvelope<Category>>(`/categories/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    remove: (id: number) => request<ApiEnvelope<{ message: string }>>(`/categories/${id}`, { method: "DELETE" }),
  },
  authors: {
    list: () => request<ApiEnvelope<Author[]>>("/authors"),
    create: (body: { name: string }) => request<ApiEnvelope<Author>>("/authors", { method: "POST", body: JSON.stringify(body) }),
    update: (id: number, body: { name?: string }) => request<ApiEnvelope<Author>>(`/authors/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    remove: (id: number) => request<ApiEnvelope<{ message: string }>>(`/authors/${id}`, { method: "DELETE" }),
  },
  publishers: {
    list: () => request<ApiEnvelope<Publisher[]>>("/publishers"),
    create: (body: { name: string; address?: string; phone?: string }) => request<ApiEnvelope<Publisher>>("/publishers", { method: "POST", body: JSON.stringify(body) }),
    update: (id: number, body: { name?: string; address?: string; phone?: string }) => request<ApiEnvelope<Publisher>>(`/publishers/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    remove: (id: number) => request<ApiEnvelope<{ message: string }>>(`/publishers/${id}`, { method: "DELETE" }),
  },
  members: {
    list: (params: URLSearchParams) => request<ApiEnvelope<Member[]>>(`/members?${params.toString()}`),
    get: (id: number) => request<ApiEnvelope<Member>>(`/members/${id}`),
    update: (id: number, body: { name?: string; email?: string; phone?: string; address?: string }) => request<ApiEnvelope<Member>>(`/members/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    updateStatus: (id: number, status: Member["status"]) => request<ApiEnvelope<Member>>(`/members/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  },
  requests: {
    create: (body: { bookIds: number[]; requestedDurationDays: number; notes?: string }) => request<ApiEnvelope<LoanRequest>>("/loan-requests", { method: "POST", body: JSON.stringify(body) }),
    me: (params: URLSearchParams) => request<ApiEnvelope<LoanRequest[]>>(`/loan-requests/me?${params.toString()}`),
    list: (params: URLSearchParams) => request<ApiEnvelope<LoanRequest[]>>(`/loan-requests?${params.toString()}`),
    approve: (id: number) => request<ApiEnvelope<Loan>>(`/loan-requests/${id}/approve`, { method: "PATCH" }),
    reject: (id: number, rejectionReason: string) => request<ApiEnvelope<LoanRequest>>(`/loan-requests/${id}/reject`, { method: "PATCH", body: JSON.stringify({ rejectionReason }) }),
    cancel: (id: number) => request<ApiEnvelope<LoanRequest>>(`/loan-requests/${id}/cancel`, { method: "PATCH" }),
  },
  loans: {
    me: (params: URLSearchParams) => request<ApiEnvelope<Loan[]>>(`/loans/me?${params.toString()}`),
    list: (params: URLSearchParams) => request<ApiEnvelope<Loan[]>>(`/loans?${params.toString()}`),
    overdue: (params: URLSearchParams) => request<ApiEnvelope<Loan[]>>(`/loans/overdue?${params.toString()}`),
    returnItem: (loanId: number, itemId: number, body: { returnStatus?: "ON_TIME" | "LATE"; lateDays?: number; notes?: string }) => request<ApiEnvelope<Loan>>(`/loans/${loanId}/items/${itemId}/return`, { method: "PATCH", body: JSON.stringify(body) }),
    returnLoan: (loanId: number, body: { returnStatus?: "ON_TIME" | "LATE"; lateDays?: number; notes?: string; itemIds?: number[] }) => request<ApiEnvelope<Loan>>(`/loans/${loanId}/return`, { method: "PATCH", body: JSON.stringify(body) }),
  },
  fines: {
    me: (params: URLSearchParams) => request<ApiEnvelope<Fine[]>>(`/fines/me?${params.toString()}`),
    list: (params: URLSearchParams) => request<ApiEnvelope<Fine[]>>(`/fines?${params.toString()}`),
    pay: (id: number) => request<ApiEnvelope<Fine>>(`/fines/${id}/pay`, { method: "PATCH" }),
    waive: (id: number, notes?: string) => request<ApiEnvelope<Fine>>(`/fines/${id}/waive`, { method: "PATCH", body: JSON.stringify({ notes }) }),
  },
  settings: {
    list: () => request<ApiEnvelope<SystemSetting[]>>("/settings"),
    update: (key: string, value: string | number) => request<ApiEnvelope<SystemSetting>>(`/settings/${key}`, { method: "PATCH", body: JSON.stringify({ value }) }),
  },
  reports: {
    loans: (params: URLSearchParams) => request<ApiEnvelope<Loan[]>>(`/reports/loans?${params.toString()}`),
    fines: (params: URLSearchParams) => request<ApiEnvelope<Fine[]>>(`/reports/fines?${params.toString()}`),
    exportLoans: (params: URLSearchParams) => request<ArrayBuffer>(`/reports/loans/export.xlsx?${params.toString()}`),
    exportFines: (params: URLSearchParams) => request<ArrayBuffer>(`/reports/fines/export.xlsx?${params.toString()}`),
  },
};

export type Role = "PETUGAS" | "ANGGOTA";

export type User = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  isActive: boolean;
  member?: {
    id: number;
    memberCode: string;
    address?: string | null;
    birthDate?: string | null;
    status: "ACTIVE" | "INACTIVE" | "BLOCKED";
  } | null;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
};

export type DashboardSummary = {
  totalBooks: number;
  totalCopies: number;
  availableCopies: number;
  borrowedCopies: number;
  totalMembers: number;
  pendingRequests: number;
  activeLoans: number;
  overdueLoans: number;
  unpaidFines: { count: number; amount: number | string };
};

export type Category = { id: number; name: string; slug: string };
export type Author = { id: number; name: string };
export type Publisher = { id: number; name: string };
export type BookCopy = { id: number; inventoryCode: string; conditionStatus: string; availabilityStatus: string; notes?: string | null; acquisitionDate?: string | null };
export type Book = {
  id: number;
  title: string;
  description?: string | null;
  publicationYear?: number | null;
  language: string;
  coverUrl?: string | null;
  category?: Category | null;
  publisher?: Publisher | null;
  authors: Author[];
  availability: { total: number; available: number; borrowed: number; maintenance: number; lost: number };
  copies?: BookCopy[];
};
export type BookPayload = Partial<Pick<Book, "title" | "description" | "publicationYear" | "language" | "coverUrl">> & {
  categoryId?: number | null;
  publisherId?: number | null;
  authorIds?: number[];
  copyCount?: number;
};
export type CopyPayload = { inventoryCode: string; conditionStatus?: string; availabilityStatus?: string; notes?: string };
export type Member = { id: number; memberCode: string; address?: string | null; status: "ACTIVE" | "INACTIVE" | "BLOCKED"; user: { name: string; email: string; phone?: string | null } };
export type LoanRequest = { id: number; status: string; requestedDurationDays: number; createdAt: string; notes?: string | null; rejectionReason?: string | null; member: { user: { name: string; email: string } }; items: { book: { id: number; title: string } }[] };
export type Loan = { id: number; loanCode: string; status: string; borrowedAt: string; dueAt: string; member: { user: { name: string; email: string } }; items: { id: number; returnedAt?: string | null; bookCopy: { book: { title: string } }; fine?: { amount: number | string; status: string } | null }[] };
export type Fine = { id: number; lateDays: number; amount: number | string; status: string; createdAt: string; member: { user: { name: string; email: string } }; loanItem: { loan: { loanCode: string }; bookCopy: { book: { title: string } } } };
export type SystemSetting = { id: number; settingKey: string; settingValue: string; description?: string | null };
