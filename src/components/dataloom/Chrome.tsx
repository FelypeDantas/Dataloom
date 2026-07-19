import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface LogoProps {
  compact?: boolean;
}

interface AppLinkProps {
  to: "/app" | "/";
  children: React.ReactNode;
  variant?: "ghost" | "primary";
}

const CURRENT_YEAR = new Date().getFullYear();

const FOOTER_LINKS = [
  { label: "Termos", href: "#" },
  { label: "Privacidade", href: "#" },
  { label: "Segurança", href: "#" },
] as const;

const containerClassName =
  "mx-auto flex max-w-7xl items-center justify-between px-6";

function Logo({ compact = false }: LogoProps) {
  return (
    <Link
      to="/"
      aria-label="Página inicial do Dataloom"
      className="flex items-center gap-2"
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-sm bg-foreground",
          compact ? "size-4" : "size-6",
        )}
      >
        {!compact && (
          <div className="size-2 rounded-full bg-background" />
        )}
      </div>

      <span className="text-lg font-bold uppercase tracking-tight">
        Dataloom
      </span>
    </Link>
  );
}

function AppLink({
  to,
  children,
  variant = "ghost",
}: AppLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        variant === "ghost"
          ? "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          : buttonVariants({
              variant: "default",
              size: "sm",
            }),
      )}
    >
      {children}
    </Link>
  );
}

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <nav
        className={cn(containerClassName, "h-14")}
        aria-label="Principal"
      >
        <Logo />

        <div className="flex items-center gap-4">
          <AppLink to="/app">
            Abrir app
          </AppLink>

          <AppLink
            to="/app"
            variant="primary"
          >
            Começar
          </AppLink>
        </div>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border py-10">
      <div
        className={cn(
          containerClassName,
          "flex-col gap-6 md:flex-row",
        )}
      >
        <Logo compact />

        <p className="text-center text-xs text-muted-foreground">
          © {CURRENT_YEAR} Dataloom Intelligence. Todos os direitos reservados.
        </p>

        <nav
          aria-label="Links institucionais"
          className="flex gap-6 text-xs font-medium text-muted-foreground"
        >
          {FOOTER_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="transition-colors hover:text-foreground"
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
