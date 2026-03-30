"use client";

import { useState } from "react";
import { Download, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { t } from "@/lib/settingsI18n";
import type { LogEntry } from "@/types";

type ExportFormat = "json" | "text";

interface DownloadLogsButtonProps {
  entries: LogEntry[];
}

export default function DownloadLogsButton({ entries }: DownloadLogsButtonProps) {
  const [open, setOpen] = useState(false);
  const language = useLanguagePreference();

  const download = (format: ExportFormat) => {
    setOpen(false);
    let content: string;
    let mime: string;
    let ext: string;

    if (format === "json") {
      content = JSON.stringify(entries, null, 2);
      mime = "application/json";
      ext = "json";
    } else {
      content = entries
        .map((e) => `[${e.timestamp}] [${e.level.toUpperCase().padEnd(5)}] [${e.container}] ${e.message}`)
        .join("\n");
      mime = "text/plain";
      ext = "txt";
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inno-web-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)}>
        <Download className="h-3.5 w-3.5 mr-1.5" />
        {t(language, "logs.export")}
        <ChevronDown className="h-3.5 w-3.5 ml-1.5" />
      </Button>

      {open && (
        <>
          {/* backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 z-20 min-w-[10rem] rounded-md border bg-popover shadow-md py-1">
            <button
              onClick={() => download("json")}
              className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors"
            >
              {t(language, "logs.exportJson")}
            </button>
            <button
              onClick={() => download("text")}
              className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors"
            >
              {t(language, "logs.exportText")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
