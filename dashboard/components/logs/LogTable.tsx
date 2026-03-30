"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { localeFromLanguage, logLevelLabel, t } from "@/lib/settingsI18n";
import type { LogEntry, LogLevel } from "@/types";

const levelStyle: Record<LogLevel, string> = {
  debug: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  info:  "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  warn:  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300",
  error: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
  fatal: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
};

const rowHighlight: Record<LogLevel, string> = {
  debug: "",
  info:  "",
  warn:  "bg-yellow-50/60 dark:bg-yellow-900/10",
  error: "bg-red-50/60 dark:bg-red-900/10",
  fatal: "bg-purple-50/60 dark:bg-purple-900/10",
};

interface LogTableProps {
  entries: LogEntry[];
  searchQuery: string;
  isRegex: boolean;
}

function highlightText(text: string, pattern: string, isRegex: boolean): React.ReactNode {
  if (!pattern) return text;
  try {
    const re = isRegex
      ? new RegExp(`(${pattern})`, "gi")
      : new RegExp(`(${pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(re);
    return parts.map((p, i) =>
      re.test(p) ? <mark key={i} className="bg-yellow-300/50 text-inherit rounded-sm">{p}</mark> : p
    );
  } catch {
    return text;
  }
}

function LogRow({
  entry,
  searchQuery,
  isRegex,
  locale,
}: {
  entry: LogEntry;
  searchQuery: string;
  isRegex: boolean;
  locale: string;
}) {
  const language = useLanguagePreference();
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          "border-b last:border-0 cursor-pointer transition-colors hover:bg-muted/40",
          rowHighlight[entry.level]
        )}
      >
        <td className="py-2 pl-2 w-5">
          {expanded
            ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          }
        </td>
        <td className="py-2 text-xs text-muted-foreground whitespace-nowrap font-mono">
          {new Date(entry.timestamp).toLocaleString(locale)}
        </td>
        <td className="py-2 px-2">
          <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase", levelStyle[entry.level])}>
            {logLevelLabel(language, entry.level)}
          </span>
        </td>
        <td className="py-2 px-2 font-mono text-xs text-muted-foreground whitespace-nowrap">{entry.container}</td>
        <td className="py-2 pr-3 text-sm truncate max-w-md">
          {highlightText(entry.message, searchQuery, isRegex)}
        </td>
      </tr>
      {expanded && (
        <tr className="bg-muted/30 border-b last:border-0">
          <td colSpan={5} className="px-6 py-3">
            <div className="space-y-1 text-xs">
              <div className="flex gap-2">
                <span className="text-muted-foreground w-20 flex-shrink-0">{t(language, "logs.timestamp")}</span>
                <span className="font-mono">{entry.timestamp}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground w-20 flex-shrink-0">{t(language, "logs.container")}</span>
                <span className="font-mono">{entry.container}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground w-20 flex-shrink-0">{t(language, "logs.level")}</span>
                <span className="uppercase font-semibold">{logLevelLabel(language, entry.level)}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground w-20 flex-shrink-0">{t(language, "logs.message")}</span>
                <span className="font-mono break-all whitespace-pre-wrap">{entry.message}</span>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function LogTable({ entries, searchQuery, isRegex }: LogTableProps) {
  const language = useLanguagePreference();
  const locale = localeFromLanguage(language);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t(language, "logs.tableTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-2 pl-2 w-5" />
              <th className="pb-2 font-medium whitespace-nowrap px-1">{t(language, "logs.timestamp")}</th>
              <th className="pb-2 font-medium px-2">{t(language, "logs.level")}</th>
              <th className="pb-2 font-medium px-2">{t(language, "logs.container")}</th>
              <th className="pb-2 font-medium pr-3">{t(language, "logs.message")}</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted-foreground">
                  {t(language, "logs.noEntries")}
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <LogRow key={entry.id} entry={entry} searchQuery={searchQuery} isRegex={isRegex} locale={locale} />
              ))
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
