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
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { label: "Hosts", href: "/dashboard/hosts", icon: Server },
  { label: "Pipelines", href: "/dashboard/pipelines", icon: GitBranch },
  { label: "Deployments", href: "/dashboard/deployments", icon: Activity },
  { label: "Alerts", href: "/dashboard/alerts", icon: ShieldAlert },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col w-64 border-r border-blue-200/15 bg-[#0a2148]/70 backdrop-blur min-h-screen">
      {/* ── Brand ──────────────────────────────── */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-blue-200/15">
        <Rocket className="h-6 w-6 text-cyan-300" />
        <span className="text-xl font-bold tracking-tight text-blue-50">InnoDeploy</span>
      </div>

      {/* ── Navigation ─────────────────────────── */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ label, href, icon: Icon }) => {
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
                  : "text-blue-100/75 hover:bg-blue-100/10 hover:text-blue-50"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer ─────────────────────────────── */}
      <div className="px-6 py-4 border-t border-blue-200/15 text-xs text-blue-100/55">
      </div>
    </aside>
  );
}
