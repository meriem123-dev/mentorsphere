
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface SidebarMobileContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const SidebarMobileContext = createContext<SidebarMobileContextValue | null>(null);

export function SidebarMobileProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <SidebarMobileContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </SidebarMobileContext.Provider>
  );
}

export function useSidebarMobile() {
  const ctx = useContext(SidebarMobileContext);
  if (!ctx) {
    throw new Error("useSidebarMobile must be used within a SidebarMobileProvider");
  }
  return ctx;
}