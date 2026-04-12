"use client";

import {
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const STORAGE_KEY = "vitruvian-chat-open";

let listeners: Array<() => void> = [];
let hydrated = false;

function emitChange() {
  for (const l of listeners) l();
}

function subscribe(cb: () => void) {
  listeners = [...listeners, cb];
  if (!hydrated) {
    hydrated = true;
    queueMicrotask(emitChange);
  }
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}

function getSnapshot() {
  if (!hydrated) return false;
  return localStorage.getItem(STORAGE_KEY) === "true";
}

function getServerSnapshot() {
  return false;
}

const ChatContext = createContext<{ isOpen: boolean; toggle: () => void }>({
  isOpen: false,
  toggle: () => {},
});

export function ChatProvider({ children }: { children: ReactNode }) {
  const isOpen = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(() => {
    const next = !(localStorage.getItem(STORAGE_KEY) === "true");
    localStorage.setItem(STORAGE_KEY, String(next));
    emitChange();
  }, []);

  return <ChatContext value={{ isOpen, toggle }}>{children}</ChatContext>;
}

export const useChatOpen = () => useContext(ChatContext);
