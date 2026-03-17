import type { Transaction } from "../interfaces";

const API_BASE = import.meta.env.VITE_API_BASE_URL ;

export type SubmitResult =
  | { ok: true; status: 200; transaction: Transaction; meta?: unknown }
  | { ok: false; status: number; transaction?: Transaction; meta?: unknown };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type IdempotencyStore = Record<string, string>;
const IDEMPOTENCY_STORAGE_KEY = "stealth:idempotency:v1";

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function normalizePayloadKey(email: string, amount: number) {
  return `${email.trim().toLowerCase()}:${amount}`;
}

function loadIdempotencyStore(): IdempotencyStore {
  return safeJsonParse<IdempotencyStore>(localStorage.getItem(IDEMPOTENCY_STORAGE_KEY)) ?? {};
}


function saveIdempotencyStore(store: IdempotencyStore) {
  localStorage.setItem(IDEMPOTENCY_STORAGE_KEY, JSON.stringify(store));
}


export function getOrCreateIdempotencyKey(email: string, amount: number) {
  const payloadKey = normalizePayloadKey(email, amount);
  const store = loadIdempotencyStore();

  const existing = store[payloadKey];
  if (existing) return existing;

  const uuid =
    globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  store[payloadKey] = uuid;
  saveIdempotencyStore(store);
  return uuid;
}

export function clearIdempotencyKey(email: string, amount: number) {
  const payloadKey = normalizePayloadKey(email, amount);
  const store = loadIdempotencyStore();
  if (!store[payloadKey]) return;
  delete store[payloadKey];
  saveIdempotencyStore(store);
}

export async function listTransactions(): Promise<Transaction[]> {
  const res = await fetch(`${API_BASE}/transactions`, { method: "GET" });
  if (!res.ok) throw new Error(`Failed to list transactions (${res.status})`);
  const json = (await res.json()) as { data?: Transaction[] };
  return json.data ?? [];
}

async function postTransaction(params: {
  email: string;
  amount: number;
  idempotencyKey: string;
}): Promise<SubmitResult> {
  const res = await fetch(`${API_BASE}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": params.idempotencyKey,
    },
    body: JSON.stringify({ email: params.email, amount: params.amount }),
  });

  const json = (await res.json().catch(() => null)) as any;

  if (res.ok) return { ok: true, status: 200, transaction: json?.data, meta: json?.meta };
  return { ok: false, status: res.status, transaction: json?.data, meta: json?.meta };
}

export async function submitTransactionWithRetry(params: {
  email: string;
  amount: number;
  idempotencyKey: string;
  maxAttempts: number;
  onAttempt?: (attempt: number) => void;
}): Promise<(SubmitResult & { attemptsUsed: number })> {
  let attempt = 0;

  while (true) {
    attempt += 1;
    params.onAttempt?.(attempt);

    const result = await postTransaction({
      email: params.email,
      amount: params.amount,
      idempotencyKey: params.idempotencyKey,
    });

    if (result.ok) return { ...result, attemptsUsed: attempt };

    if (!(result.status === 503 && attempt < params.maxAttempts)) {
      return { ...result, attemptsUsed: attempt };
    }

    const backoffMs = Math.min(4000, 400 * 2 ** (attempt - 1));
    const jitterMs = Math.floor(Math.random() * 200);
    await sleep(backoffMs + jitterMs);
  }
}

