'use client';

import { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { GenerateScenariosResponse } from '@/types/scenario';
import type { StartProfile } from '@/types/startProfile';
import type { BranchNode } from '@/lib/collectBranch';

/** Что Canvas передаёт при connect к glimpse */
export type GenerateFromBranchPayload = {
  profile: StartProfile;
  branch: BranchNode[];
  anchorNodeId: string;
  glimpseNodeId: string;
};

/** Ответ API + метаданные для отрисовки на канвасе */
export type ApplyScenariosPayload = GenerateScenariosResponse & {
  anchorNodeId: string;
  glimpseNodeId: string;
};

type ScenarioContextType = {
  isGenerating: boolean;
  generateFromBranch: (payload: GenerateFromBranchPayload) => Promise<void>;
  registerApplyScenarios: (fn: (data: ApplyScenariosPayload) => void) => void;
};

const ScenarioContext = createContext<ScenarioContextType | null>(null);

export function ScenarioProvider({ children }: { children: React.ReactNode }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const applyRef = useRef<((data: ApplyScenariosPayload) => void) | null>(null);

  const registerApplyScenarios = useCallback(
    (fn: (data: ApplyScenariosPayload) => void) => {
      applyRef.current = fn;
    },
    [],
  );

  const generateFromBranch = useCallback(
    async (payload: GenerateFromBranchPayload) => {
      const { profile, branch, anchorNodeId, glimpseNodeId } = payload;

      if (!profile.goals?.trim()) {
        console.error('Goal is required in profile');
        return;
      }

      if (branch.length === 0) {
        console.error('Branch is empty');
        return;
      }

      if (isGenerating) return;

      setIsGenerating(true);

      try {
        const res = await fetch('/api/generate-scenarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profile,
            branch,
            anchorNodeId,
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.scenarios) {
          console.error('Generation failed:', data.error ?? res.statusText);
          return;
        }

        applyRef.current?.({
          ...data,
          anchorNodeId,
          glimpseNodeId,
        });
      } catch (error) {
        console.error('generateFromBranch error:', error);
      } finally {
        setIsGenerating(false);
      }
    },
    [isGenerating],
  );

  return (
    <ScenarioContext.Provider
      value={{ isGenerating, generateFromBranch, registerApplyScenarios }}
    >
      {children}
    </ScenarioContext.Provider>
  );
}

export function useScenario() {
  const ctx = useContext(ScenarioContext);
  if (!ctx) {
    throw new Error('useScenario must be used within ScenarioProvider');
  }
  return ctx;
}