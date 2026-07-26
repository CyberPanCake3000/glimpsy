'use client';

import { useEffect, useState } from 'react';

export function useEmojiFromText(text: string, nodeType: 'event' | 'action') {
  const [emoji, setEmoji] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = text.trim();
    if (trimmed.length < 3) {
      setEmoji(null);
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
        setEmoji(data.emoji ?? null);
      } catch {
        setEmoji(null);
      } finally {
        setLoading(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [text, nodeType]);

  return { emoji, loading };
}