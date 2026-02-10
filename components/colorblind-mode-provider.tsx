"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const COLORBLIND_MODE_STORAGE_KEY = "colorblind-mode";

type ColorblindModeContextValue = {
  isColorblindMode: boolean;
  setColorblindMode: (enabled: boolean) => void;
  mounted: boolean;
};

const ColorblindModeContext = createContext<ColorblindModeContextValue | undefined>(
  undefined,
);

type ColorblindModeProviderProps = {
  children: React.ReactNode;
};

export function ColorblindModeProvider({ children }: ColorblindModeProviderProps) {
  const [isColorblindMode, setIsColorblindMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedValue = window.localStorage.getItem(COLORBLIND_MODE_STORAGE_KEY);
    setIsColorblindMode(storedValue === "enabled");
  }, []);

  const setColorblindMode = (enabled: boolean) => {
    setIsColorblindMode(enabled);
    window.localStorage.setItem(
      COLORBLIND_MODE_STORAGE_KEY,
      enabled ? "enabled" : "disabled",
    );
  };

  const value = useMemo(
    () => ({ isColorblindMode, setColorblindMode, mounted }),
    [isColorblindMode, mounted],
  );

  return (
    <ColorblindModeContext.Provider value={value}>
      {children}
    </ColorblindModeContext.Provider>
  );
}

export function useColorblindMode() {
  const context = useContext(ColorblindModeContext);
  if (!context) {
    throw new Error("useColorblindMode must be used within ColorblindModeProvider");
  }

  return context;
}
