"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  BriefcaseBusiness,
  Users,
  MessageSquare,
  CalendarDays,
  FileText,
  ShieldCheck,
  BarChart3,
  Settings,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/container";
import { Navbar } from "@/components/navbar";
import { IconBadge } from "@/components/ui/icon-badge";

const nav = [
  { href: "/employer", label: "Dashboard", icon: Home },
  { href: "/employer/company", label: "Company", icon: Building2 },
  { href: "/employer/jobs", label: "Jobs", icon: BriefcaseBusiness },
  { href: "/employer/applicants", label: "Applicants", icon: Users },
  { href: "/employer/messages", label: "Messages", icon: MessageSquare },
  { href: "/employer/interviews", label: "Interviews", icon: CalendarDays },
  { href: "/employer/offers", label: "Offers", icon: FileText },
  { href: "/employer/team", label: "Team", icon: Users },
  { href: "/employer/trust", label: "Trust", icon: ShieldCheck },
  { href: "/employer/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/employer/settings", label: "Settings", icon: Settings },
] as const;

export function EmployerShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <Container className="py-8 flex-1">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-[var(--radius)] border border-border bg-card shadow-sm">
              <div className="border-b border-border p-4">
                <div className="flex items-center gap-3">
                  <IconBadge icon={Building2} tone="gold" size="md" label="Employer OS" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">Employer</p>
                    <p className="text-xs text-muted-foreground">Hiring OS</p>
                  </div>
                </div>
              </div>
              <nav className="p-2">
                {nav.map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== "/employer" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-[var(--radius)] px-3 py-2 text-sm font-medium transition",
                        active
                          ? "bg-primary/10 text-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <item.icon className="h-4 w-4" aria-hidden />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          <main className="min-w-0">{children}</main>
        </div>
      </Container>
    </div>
  );
}







