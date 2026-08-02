'use client';

import { useEffect, useRef, useState } from 'react';

type Options = {
  cachedEmoji?: string | null;
  onEmojiChange?: (emoji: string | null) => void;
};

export function useEmojiFromText(
  text: string,
  nodeType: 'event' | 'action' | 'goal',
  options?: Options,
) {
  const cachedEmoji = options?.cachedEmoji;
  const onEmojiChange = options?.onEmojiChange;
  const [emoji, setEmoji] = useState<string | null>(cachedEmoji ?? null);
  const [loading, setLoading] = useState(false);
  const skipFetchOnceRef = useRef(Boolean(cachedEmoji));
  const initialCachedEmojiRef = useRef(options?.cachedEmoji);
  const onEmojiChangeRef = useRef(options?.onEmojiChange);
  onEmojiChangeRef.current = options?.onEmojiChange;

  useEffect(() => {
    const trimmed = text.trim();
    if (trimmed.length < 3) {
      setEmoji(null);
      onEmojiChangeRef.current?.(null);
      skipFetchOnceRef.current = false;
      return;
    }

    if (skipFetchOnceRef.current && initialCachedEmojiRef.current) {
      skipFetchOnceRef.current = false;
      setEmoji(initialCachedEmojiRef.current);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/generate-emoji', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: trimmed, nodeType }),
        });
        const data = await res.json();
        const nextEmoji = data.emoji ?? null;
        setEmoji(nextEmoji);
        onEmojiChangeRef.current?.(nextEmoji);
      } catch {
        setEmoji(null);
        onEmojiChange?.(null);
      } finally {
        setLoading(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [text, nodeType]);

  return { emoji, loading };
}