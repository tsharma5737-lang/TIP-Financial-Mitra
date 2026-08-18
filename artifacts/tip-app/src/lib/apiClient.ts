// The one place that knows how to talk to the real TIP server.
// If the server address ever changes again, only this one line needs updating.
const API_BASE_URL = "https://api.creafintech.com";

const TOKEN_KEY = "tip_token";
const USER_KEY = "tip_user";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
export function setUser(user: any) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}
export function clearUser() {
  localStorage.removeItem(USER_KEY);
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ---- Login ----
export const requestOtp = (mobile: string) =>
  request("/api/auth/request-otp", { method: "POST", body: JSON.stringify({ mobile }) });

export const verifyOtp = (mobile: string, otp: string) =>
  request("/api/auth/verify-otp", { method: "POST", body: JSON.stringify({ mobile, otp }) });

// ---- The core demo screen: card recommendation ----
export const getRecommendation = (params: { merchant_name?: string; vpa?: string; amount: number }) =>
  request("/api/recommend", { method: "POST", body: JSON.stringify(params) });

// ---- Cards (needed for onboarding / manual card add) ----
export const getAllCards = () => request("/api/cards/all");
export const getMyCards = () => request("/api/cards/my-cards");

export const addCard = (card_id: string, extra: Record<string, any> = {}) =>
  request("/api/cards/add", { method: "POST", body: JSON.stringify({ card_id, ...extra }) });

export const removeCard = (cardId: string) =>
  request(`/api/cards/remove/${cardId}`, { method: "DELETE" });

// ---- Confirm a payment (manual entry, since browsers can't read SMS) ----
export const confirmTransaction = (params: {
  card_id: string; merchant_name: string; amount: number;
  recommended_card_id?: string; actual_earning?: number; potential_saving?: number;
}) => request("/api/transactions/confirm", { method: "POST", body: JSON.stringify(params) });

export const getTransactions = (page: number = 1) => request(`/api/transactions?page=${page}`);

// ---- Dashboard / Rewards (for later tasks) ----
export const getInsightsDashboard = (period?: string) =>
  request(`/api/insights/dashboard${period ? `?period=${period}` : ""}`);

export const getLossDashboard = () => request("/api/transactions/loss-dashboard");

export const getBenefitsSummary = () => request("/api/benefits/summary");
