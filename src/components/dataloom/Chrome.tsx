import { Link } from "@tanstack/react-router";

const FOOTER_LINKS = [
  { label: "Termos", href: "#" },
  { label: "Privacidade", href: "#" },
  { label: "Segurança", href: "#" },
] as const;

const CURRENT_YEAR = new Date().getFullYear();

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      to="/"
      aria-label="Página inicial do Dataloom"
      className="flex items-center gap-2"
    >
      <div
        className={`flex items-center justify-center rounded-sm bg-foreground ${
          compact ? "size-4" : "size-6"
        }`}
      >
        {!compact && <div className="size-2 rounded-full bg-background" />}
      </div>

      <span className="text-lg font-bold uppercase tracking-tight">
        Dataloom
      </span>
    </Link>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
    </Link>
  );
}

function ButtonLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
    </Link>
  );
}

export function SiteNav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Logo />

        <div className="flex items-center gap-4">
          <NavLink to="/app">Abrir app</NavLink>
          <ButtonLink to="/app">Começar</ButtonLink>
        </div>
      </div>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
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
