// src/components/auth/auth-stage.tsx
// Small shared memory for the auth screens. It holds two UI-only things:
//   1. the role picked on sign-up, so the photo panel can swap to that role
//   2. the tab the person just clicked, so the pill, photo and copy react on
//      the same frame instead of waiting for the next page to arrive.
// Nothing here is sent to the server.
"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type AuthMode = "sign-in" | "sign-up";

type AuthStage = {
  role: string;
  setRole: (role: string) => void;
  pendingMode: AuthMode | null;
  setPendingMode: (mode: AuthMode | null) => void;
  beginSwitch: (event: React.MouseEvent<HTMLElement>, target: AuthMode) => void;
};

const noop = () => {};

const AuthStageContext = createContext<AuthStage>({
  role: "",
  setRole: noop,
  pendingMode: null,
  setPendingMode: noop,
  beginSwitch: noop,
});

export function AuthStageProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState("");
  const [pendingMode, setPendingMode] = useState<AuthMode | null>(null);

  // Plain left-clicks only. Cmd/Ctrl/Shift-click opens a new tab, which must not
  // flip this page.
  const beginSwitch = useCallback((event: React.MouseEvent<HTMLElement>, target: AuthMode) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    setPendingMode(target);
  }, []);

  const value = useMemo(
    () => ({ role, setRole, pendingMode, setPendingMode, beginSwitch }),
    [role, pendingMode, beginSwitch],
  );

  return <AuthStageContext.Provider value={value}>{children}</AuthStageContext.Provider>;
}

export function useAuthStage() {
  return useContext(AuthStageContext);
}