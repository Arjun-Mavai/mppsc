/**
 * useChatStorage — SSR-safe, persistent chat storage utility
 *
 * Uses useSyncExternalStore so Next.js SSR doesn't throw hydration errors.
 * Backed by localStorage with 24-hour TTL auto-clear.
 *
 * Keys used:
 *   mppsc_visitor_id       — permanent global visitor ID (never changes)
 *   mppsc_chat_msgs_{id}   — last 50 messages with TTL timestamp
 *   mppsc_unread_{id}      — unread message count (for red badge)
 */

import { useCallback, useSyncExternalStore } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────
const VISITOR_KEY = 'mppsc_visitor_id';
const MSGS_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_MSGS = 50;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Generate a random 9-char ID like "x7k2p9q1m" */
function genId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 11)}`;
}

/** Safe localStorage getter — returns null on SSR or error */
function lsGet(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Safe localStorage setter */
function lsSet(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch { /* quota exceeded — ignore */ }
}

/** Safe localStorage remover */
function lsRemove(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch { /* ignore */ }
}

// ─── Global Visitor ID ───────────────────────────────────────────────────────

/**
 * Returns a permanent visitorId for this browser.
 * On first visit, generates + stores one. Never changes.
 * Returns '' during SSR.
 */
export function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return '';
  let id = lsGet(VISITOR_KEY);
  if (!id) {
    id = genId('visitor');
    lsSet(VISITOR_KEY, id);
  }
  return id;
}

/** Derives a stable studentId from visitorId */
export function getStudentId(visitorId: string): string {
  return visitorId ? `student_${visitorId.replace('visitor_', '')}` : '';
}

// ─── useSyncExternalStore Subscription ──────────────────────────────────────

type Listener = () => void;
const listeners = new Set<Listener>();

function emitStorageChange() {
  listeners.forEach((l) => l());
}

function subscribeStorage(cb: Listener) {
  listeners.add(cb);

  // Also listen to storage events from other tabs
  const handler = () => emitStorageChange();
  window.addEventListener('storage', handler);

  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', handler);
  };
}

function getServerSnapshot(): null {
  return null;
}

// ─── Message Persistence ─────────────────────────────────────────────────────

interface PersistedMessages<T> {
  msgs: T[];
  savedAt: number;
}

export function loadMessages<T>(visitorId: string): T[] {
  if (!visitorId) return [];
  const raw = lsGet(`mppsc_chat_msgs_${visitorId}`);
  if (!raw) return [];
  try {
    const parsed: PersistedMessages<T> = JSON.parse(raw);
    const age = Date.now() - parsed.savedAt;
    if (age > MSGS_TTL_MS) {
      lsRemove(`mppsc_chat_msgs_${visitorId}`);
      return [];
    }
    return parsed.msgs ?? [];
  } catch {
    return [];
  }
}

export function saveMessages<T>(visitorId: string, msgs: T[]): void {
  if (!visitorId || msgs.length === 0) return;
  const payload: PersistedMessages<T> = {
    msgs: msgs.slice(-MAX_MSGS),
    savedAt: Date.now(),
  };
  lsSet(`mppsc_chat_msgs_${visitorId}`, JSON.stringify(payload));
}

export function clearMessages(visitorId: string): void {
  if (!visitorId) return;
  lsRemove(`mppsc_chat_msgs_${visitorId}`);
}

// ─── Unread Count ─────────────────────────────────────────────────────────────

function unreadKey(visitorId: string) {
  return `mppsc_unread_${visitorId}`;
}

export function getUnreadCount(visitorId: string): number {
  const raw = lsGet(unreadKey(visitorId));
  return raw ? parseInt(raw, 10) || 0 : 0;
}

export function incrementUnread(visitorId: string): void {
  const current = getUnreadCount(visitorId);
  lsSet(unreadKey(visitorId), String(current + 1));
  emitStorageChange();
}

export function clearUnread(visitorId: string): void {
  lsRemove(unreadKey(visitorId));
  emitStorageChange();
}

// ─── React Hook ──────────────────────────────────────────────────────────────

interface UseChatStorageReturn {
  visitorId: string;
  studentId: string;
  unreadCount: number;
  clearUnreadCount: () => void;
}

export function useChatStorage(): UseChatStorageReturn {
  // SSR-safe: returns null on server, real value on client
  const visitorId = useSyncExternalStore(
    subscribeStorage,
    () => getOrCreateVisitorId(),
    getServerSnapshot
  ) ?? '';

  const unreadCount = useSyncExternalStore(
    subscribeStorage,
    () => getUnreadCount(visitorId),
    () => 0
  );

  const studentId = getStudentId(visitorId);

  const clearUnreadCount = useCallback(() => {
    clearUnread(visitorId);
  }, [visitorId]);

  return { visitorId, studentId, unreadCount, clearUnreadCount };
}
