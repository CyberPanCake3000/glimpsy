'use client';

import { createContext, useContext, useState } from 'react';

type TooltipContextType = {
  activeNodeId: string | null;
  toggleTooltip: (nodeId: string) => void;
  closeTooltip: () => void;
};

const TooltipContext = createContext<TooltipContextType | null>(null);

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  const toggleTooltip = (nodeId: string) => {
    setActiveNodeId((current) => (current === nodeId ? null : nodeId));
  };

  const closeTooltip = () => setActiveNodeId(null);

  return (
    <TooltipContext.Provider value={{ activeNodeId, toggleTooltip, closeTooltip }}>
      {children}
    </TooltipContext.Provider>
  );
}

export function useTooltip() {
  const ctx = useContext(TooltipContext);
  if (!ctx) {
    throw new Error('useTooltip must be used within TooltipProvider');
  }
  return ctx;
}