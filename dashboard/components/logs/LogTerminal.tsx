"use client";

import { useEffect, useRef } from "react";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { localeFromLanguage, t } from "@/lib/settingsI18n";
import type { LogEntry, LogLevel } from "@/types";

// ANSI-style terminal colours per level
const levelColor: Record<LogLevel, string> = {
  debug: "#6e7681",
  info:  "#58a6ff",
  warn:  "#e3b341",
  error: "#f85149",
  fatal: "#d2a8ff",
};

const containerColor = (container: string): string => {
  const palette = ["#79c0ff", "#56d364", "#ffa657", "#ff7b72", "#d2a8ff", "#39d353"];
  let h = 0;
  for (let i = 0; i < container.length; i++) h = (h * 31 + container.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
};

function highlight(text: string, pattern: string, isRegex: boolean): React.ReactNode {
  if (!pattern) return text;
  try {
    const re = isRegex ? new RegExp(`(${pattern})`, "gi") : new RegExp(`(${pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(re);
    return parts.map((p, i) => re.test(p)
      ? <mark key={i} className="bg-yellow-400/40 text-inherit rounded-sm">{p}</mark>
      : p
    );
  } catch {
    return text;
  }
}

interface LogTerminalProps {
  entries: LogEntry[];
  searchQuery: string;
  isRegex: boolean;
  autoScroll: boolean;
}

export default function LogTerminal({ entries, searchQuery, isRegex, autoScroll }: LogTerminalProps) {
  const language = useLanguagePreference();
  const locale = localeFromLanguage(language);
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [entries.length, autoScroll]);

  return (
    <div
      ref={containerRef}
      className="rounded-md bg-[#0d1117] text-[#e6edf3] font-mono text-xs leading-6 min-h-[380px] max-h-[520px] overflow-y-auto p-4 border border-[#30363d]"
      style={{ fontFamily: "'Cascadia Code', 'Fira Code', 'Consolas', monospace" }}
    >
      {/* Fake terminal title bar */}
      <div className="flex items-center gap-1.5 mb-4 opacity-60">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
        <span className="ml-3 text-[10px] text-[#6e7681]">{t(language, "nav.logs")} - inno-web</span>
      </div>

      {entries.length === 0 ? (
        <p className="text-[#6e7681]">{t(language, "logs.noEntries")}</p>
      ) : (
        entries.map((entry) => (
          <div key={entry.id} className="flex gap-2 hover:bg-white/5 rounded px-1 -mx-1 group">
            {/* timestamp */}
            <span className="flex-shrink-0 text-[#6e7681] select-none" style={{ minWidth: "13ch" }}>
              {new Date(entry.timestamp).toLocaleTimeString(locale, { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
            {/* level */}
            <span className="flex-shrink-0 uppercase font-semibold" style={{ color: levelColor[entry.level], minWidth: "5ch" }}>
              {entry.level}
            </span>
            {/* container */}
            <span className="flex-shrink-0" style={{ color: containerColor(entry.container), minWidth: "8ch" }}>
              {entry.container}
            </span>
            {/* message */}
            <span className="text-[#e6edf3] break-all">
              {highlight(entry.message, searchQuery, isRegex)}
            </span>
          </div>
        ))
      )}

      {/* blinking cursor */}
      {entries.length > 0 && (
        <div className="flex gap-2 px-1">
          <span className="text-[#6e7681]">$</span>
          <span className="inline-block w-2 h-4 bg-[#58a6ff] animate-pulse opacity-80" />
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
