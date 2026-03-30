"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  GitBranch,
  Activity,
  ShieldAlert,
  Server,
  Settings,
  Rocket,
} from "lucide-react";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { t } from "@/lib/settingsI18n";
import { cn } from "@/lib/utils";

const navItems = [
  { labelKey: "nav.overview", href: "/dashboard", icon: LayoutDashboard },
  { labelKey: "nav.projects", href: "/dashboard/projects", icon: FolderKanban },
  { labelKey: "nav.hosts", href: "/dashboard/hosts", icon: Server },
  { labelKey: "nav.pipelines", href: "/dashboard/pipelines", icon: GitBranch },
  { labelKey: "nav.deployments", href: "/dashboard/deployments", icon: Activity },
  { labelKey: "nav.alerts", href: "/dashboard/alerts", icon: ShieldAlert },
  { labelKey: "nav.settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const language = useLanguagePreference();
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col w-64 border-r border-slate-200/10 bg-[#06132b]/78 backdrop-blur min-h-screen">
      {/* ── Brand ──────────────────────────────── */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-200/10">
        <Rocket className="h-6 w-6 text-cyan-300" />
        <span className="text-xl font-bold tracking-tight text-slate-50">InnoDeploy</span>
      </div>

      {/* ── Navigation ─────────────────────────── */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ labelKey, href, icon: Icon }) => {
          const isActive = href === "/dashboard"
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-cyan-300/15 text-cyan-200"
                  : "text-slate-300/80 hover:bg-slate-200/10 hover:text-slate-50"
              )}
            >
              <Icon className="h-4 w-4" />
              {t(language, labelKey)}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer ─────────────────────────────── */}
      <div className="px-6 py-4 border-t border-slate-200/10 text-xs text-slate-400/75">
      </div>
    </aside>
  );
}
