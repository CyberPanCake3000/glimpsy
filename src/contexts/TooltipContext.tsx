'use client';

import { createContext, useContext, useState, useRef } from 'react';

type TooltipContextType = {
  activeNodeId: string | null;
  hoveredNodeId: string | null;
  setHoveredNodeId: (id: string | null) => void;
  toggleTooltip: (nodeId: string) => void;
  closeTooltip: () => void;
  scheduleHoverClose: (nodeId: string) => void;
  cancelHoverClose: () => void;
};

const TooltipContext = createContext<TooltipContextType | null>(null);

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeIdState] = useState<string | null>(null);
  const hideHoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setHoveredNodeId = (id: string | null) => {
    if (hideHoverTimeoutRef.current) clearTimeout(hideHoverTimeoutRef.current);
    setHoveredNodeIdState(id);
  };

  const scheduleHoverClose = (nodeId: string) => {
    hideHoverTimeoutRef.current = setTimeout(() => {
      setHoveredNodeIdState((current) => (current === nodeId ? null : current));
    }, 200);
  };
  
  const cancelHoverClose = () => {
    if (hideHoverTimeoutRef.current) clearTimeout(hideHoverTimeoutRef.current);
  };

  const toggleTooltip = (nodeId: string) => {
    setActiveNodeId((current) => (current === nodeId ? null : nodeId));
  };

  const closeTooltip = () => {
    cancelHoverClose();
    setActiveNodeId(null);
    setHoveredNodeIdState(null);
  };

  return (
    <TooltipContext.Provider value={{
      activeNodeId,
      hoveredNodeId,
      setHoveredNodeId,
      scheduleHoverClose,
      cancelHoverClose,
      toggleTooltip,
      closeTooltip,
    }}>
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