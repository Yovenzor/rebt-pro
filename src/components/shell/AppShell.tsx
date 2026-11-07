import { Brand, BrandMark } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { LogOut, Menu } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router";

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  badgeTone?: "error" | "warning" | "neutral";
}

function NavList({
  items,
  active,
  onNavigate,
}: {
  items: NavItem[];
  active: string;
  onNavigate: (id: string) => void;
}) {
  return (
    <nav className="flex flex-col gap-0.5">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            className={cn(
              "group relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] transition-colors",
              isActive
                ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                : "text-sidebar-foreground/65 hover:bg-white/5 hover:text-sidebar-foreground",
            )}
          >
            {isActive && (
              <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-sidebar-primary" />
            )}
            <Icon
              className={cn(
                "size-[15px] shrink-0",
                isActive ? "text-sidebar-primary" : "opacity-70",
              )}
            />
            <span className="truncate">{item.label}</span>
            {typeof item.badge === "number" && item.badge > 0 && (
              <span
                className={cn(
                  "ml-auto min-w-5 rounded-full px-1.5 py-0.5 text-center text-[10px] font-semibold tabular-nums",
                  item.badgeTone === "error"
                    ? "bg-destructive/90 text-white"
                    : item.badgeTone === "warning"
                      ? "bg-accent text-accent-foreground"
                      : "bg-white/10 text-white/70",
                )}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

export function AppShell({
  children,
  navItems,
  active,
  onNavigate,
  title,
  subtitle,
  eyebrow,
  actions,
  navLabel = "Instalación",
}: {
  children: ReactNode;
  navItems: NavItem[];
  active: string;
  onNavigate: (id: string) => void;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: ReactNode;
  navLabel?: string;
}) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const sidebarBody = (
    <>
      <div className="px-5 pb-5 pt-6">
        <Brand href="/projects" />
      </div>

      <div className="px-3 pb-6">
        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
          {navLabel}
        </p>
        <NavList
          items={navItems}
          active={active}
          onNavigate={(id) => {
            onNavigate(id);
            setMobileOpen(false);
          }}
        />
      </div>

      <div className="mt-auto border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-white/10 text-[11px] font-semibold text-white/80">
            {(user?.name || user?.email || "T")
              .slice(0, 1)
              .toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-medium text-white/85">
              {user?.name || "Técnico"}
            </p>
            <p className="truncate text-[10px] text-white/40">
              {user?.email ?? "Sesión de invitado"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-md p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <LogOut className="size-4" />
          </button>
        </div>
        <p className="px-2 pt-1 text-[10px] leading-relaxed text-white/25">
          Cálculos conforme al REBT · RD 842/2002
        </p>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="no-print fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col bg-sidebar text-sidebar-foreground lg:flex">
        {sidebarBody}
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-[280px] border-sidebar-border bg-sidebar p-0 text-sidebar-foreground"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navegación</SheetTitle>
          </SheetHeader>
          <div className="flex h-full flex-col">{sidebarBody}</div>
        </SheetContent>
      </Sheet>

      <div className="flex min-h-screen flex-col lg:pl-[248px]">
        <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-md no-print">
          <div className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu className="size-4" />
            </Button>

            <div className="min-w-0 flex-1">
              {eyebrow && <p className="eyebrow mb-0.5">{eyebrow}</p>}
              <h1 className="truncate text-[17px] font-semibold leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="truncate text-[12px] text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export function MobileBrand() {
  return (
    <span className="flex items-center gap-2">
      <BrandMark />
    </span>
  );
}
