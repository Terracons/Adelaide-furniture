'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

export default function AnnouncementBar({ messages = [] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (messages.length < 2) return undefined;
    const t = setInterval(() => setIndex((i) => (i + 1) % messages.length), 4500);
    return () => clearInterval(t);
  }, [messages.length]);

  if (!messages.length) return null;

  return (
    <div className="bg-ink text-cream">
      <div className="container flex h-9 items-center justify-center gap-2 overflow-hidden text-center">
        <Sparkles size={13} className="shrink-0 text-gold-400" />
        <p key={index} className="animate-fade-in truncate text-[11px] font-medium tracking-wide sm:text-xs">
          {messages[index]}
        </p>
      </div>
    </div>
  );
}
