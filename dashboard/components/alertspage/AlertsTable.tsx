"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Bell, BellRing, Siren, ChevronLeft, ChevronRight, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { alertRuleLabel, alertSeverityLabel, localeFromLanguage, t } from "@/lib/settingsI18n";
import { cn } from "@/lib/utils";
import type { AlertSeverity, ProjectAlert } from "@/types";

const severityIcon: Record<AlertSeverity, React.ReactNode> = {
  critical: <Siren className="h-4 w-4 text-rose-400" />,
  warning: <BellRing className="h-4 w-4 text-amber-400" />,
  info: <Bell className="h-4 w-4 text-blue-400" />,
};

const severityBadge: Record<AlertSeverity, string> = {
  critical: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  warning: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  info: "text-blue-400 bg-blue-500/10 border-blue-500/20",
};

const statusBadge: Record<string, { className: string; icon: React.ReactNode }> = {
  open: { className: "text-rose-400 bg-rose-500/10 border-rose-500/20", icon: <Clock className="h-3 w-3" /> },
  acknowledged: { className: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: <CheckCircle2 className="h-3 w-3" /> },
  resolved: { className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: <ShieldCheck className="h-3 w-3" /> },
};

const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

type SortKey = "severity" | "project" | "ruleType" | "timestamp" | "status";
type SortDirection = "asc" | "desc";

const PAGE_SIZE = 10;

interface AlertsTableProps {
  alerts: ProjectAlert[];
  selectedAlertId: string | null;
  onSelect: (alert: ProjectAlert) => void;
}

export default function AlertsTable({ alerts, selectedAlertId, onSelect }: AlertsTableProps) {
  const language = useLanguagePreference();
  const [sortKey, setSortKey] = useState<SortKey>("timestamp");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);

  const sortedAlerts = useMemo(() => {
    return [...alerts].sort((left, right) => {
      const leftValue = String(left[sortKey]);
      const rightValue = String(right[sortKey]);
      const result = leftValue.localeCompare(rightValue);
      return sortDirection === "asc" ? result : -result;
    });
  }, [alerts, sortDirection, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sortedAlerts.length / PAGE_SIZE));
  const paginatedAlerts = sortedAlerts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDirection("asc");
    setPage(1);
  };

  const sortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />;
    return sortDirection === "asc" ? <ArrowUp className="h-3.5 w-3.5 text-cyan-400" /> : <ArrowDown className="h-3.5 w-3.5 text-cyan-400" />;
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a1628]/60">
      <div className="border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{t(language, "alerts.tableTitle")}</h2>
        <span className="text-xs text-slate-600">{alerts.length} alert{alerts.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="p-6 overflow-x-auto">
        {sortedAlerts.length === 0 ? (
          <div className="py-16 text-center">
            <ShieldCheck className="mx-auto h-10 w-10 text-slate-700 mb-3" />
            <p className="text-sm text-slate-500">No alerts found for the selected filters.</p>
            <p className="text-xs text-slate-600 mt-1">Alerts will appear here when triggered by monitoring rules.</p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-left">
                  <th className="cursor-pointer pb-3 pr-4 font-medium text-slate-500 text-xs uppercase tracking-[0.1em]" onClick={() => toggleSort("severity")}><span className="flex items-center gap-1">{t(language, "alerts.severity")} {sortIcon("severity")}</span></th>
                  <th className="cursor-pointer pb-3 pr-4 font-medium text-slate-500 text-xs uppercase tracking-[0.1em]" onClick={() => toggleSort("project")}><span className="flex items-center gap-1">{t(language, "alerts.project")} {sortIcon("project")}</span></th>
                  <th className="cursor-pointer pb-3 pr-4 font-medium text-slate-500 text-xs uppercase tracking-[0.1em]" onClick={() => toggleSort("ruleType")}><span className="flex items-center gap-1">{t(language, "alerts.rule")} {sortIcon("ruleType")}</span></th>
                  <th className="pb-3 pr-4 font-medium text-slate-500 text-xs uppercase tracking-[0.1em]">{t(language, "alerts.message")}</th>
                  <th className="cursor-pointer pb-3 pr-4 font-medium text-slate-500 text-xs uppercase tracking-[0.1em]" onClick={() => toggleSort("timestamp")}><span className="flex items-center gap-1">{t(language, "alerts.timestamp")} {sortIcon("timestamp")}</span></th>
                  <th className="cursor-pointer pb-3 font-medium text-slate-500 text-xs uppercase tracking-[0.1em]" onClick={() => toggleSort("status")}><span className="flex items-center gap-1">{t(language, "alerts.status")} {sortIcon("status")}</span></th>
                </tr>
              </thead>
              <tbody>
                {paginatedAlerts.map((alert) => {
                  const sb = severityBadge[alert.severity];
                  const stb = statusBadge[alert.status] || statusBadge.open;
                  return (
                    <tr
                      key={alert.id}
                      onClick={() => onSelect(alert)}
                      className={cn(
                        "cursor-pointer border-b border-white/[0.04] last:border-0 transition-colors hover:bg-white/[0.02]",
                        selectedAlertId === alert.id && "bg-cyan-500/[0.04] border-cyan-500/10"
                      )}
                    >
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${sb}`}>
                          {severityIcon[alert.severity]}
                          {alertSeverityLabel(language, alert.severity)}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-medium text-slate-200">{alert.project}</td>
                      <td className="py-3 pr-4 capitalize text-slate-400 text-xs">{alertRuleLabel(language, alert.ruleType)}</td>
                      <td className="max-w-xs py-3 pr-4 text-slate-500 text-xs truncate">{alert.message}</td>
                      <td className="py-3 pr-4 whitespace-nowrap text-xs text-slate-500" title={new Date(alert.timestamp).toLocaleString(localeFromLanguage(language))}>
                        {timeAgo(alert.timestamp)}
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${stb.className}`}>
                          {stb.icon}
                          {alert.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-4">
                <span className="text-xs text-slate-600">Page {page} of {totalPages}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-slate-400 transition hover:border-white/[0.15] hover:bg-white/[0.06] disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronLeft className="h-3 w-3" /> Prev
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-slate-400 transition hover:border-white/[0.15] hover:bg-white/[0.06] disabled:opacity-30 disabled:pointer-events-none"
                  >
                    Next <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
