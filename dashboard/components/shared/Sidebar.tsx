"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  GitBranch,
  Activity,
  Settings,
  Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { label: "Pipelines", href: "/dashboard/pipelines", icon: GitBranch },
  { label: "Deployments", href: "/dashboard/deployments", icon: Activity },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col w-64 border-r bg-card min-h-screen">
      {/* ── Brand ──────────────────────────────── */}
      <div className="flex items-center gap-2 px-6 py-5 border-b">
        <Rocket className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold tracking-tight">InnoDeploy</span>
      </div>

      {/* ── Navigation ─────────────────────────── */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer ─────────────────────────────── */}
      <div className="px-6 py-4 border-t text-xs text-muted-foreground">
      </div>
    </aside>
  );
}
