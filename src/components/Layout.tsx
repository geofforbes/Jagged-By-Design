import type { CSSProperties, ReactElement } from "react";
import { NavLink, Link, Outlet, useLocation } from "react-router-dom";
import { useRole } from "../context/RoleContext";
import { lovedOne } from "../data/lovedOne";
import type { Role } from "../types";

const ROLE_OPTIONS: { role: Role; label: string }[] = [
  { role: "family", label: "Family" },
  { role: "admin", label: "Lead" },
  { role: "clinician", label: "Clinician" },
];

/** Cooler, more clinical palette — applied only when viewing as Clinician. */
const CLINICAL_VARS: CSSProperties = {
  "--background": "#f4f6f8",
  "--foreground": "#1f2933",
  "--card": "#ffffff",
  "--card-foreground": "#1f2933",
  "--primary": "#34495e",
  "--primary-foreground": "#ffffff",
  "--secondary": "#e6ebf0",
  "--secondary-foreground": "#3a4a58",
  "--muted": "#e6ebf0",
  "--muted-foreground": "#7c8a97",
  "--accent": "#5b7186",
  "--accent-foreground": "#ffffff",
  "--border": "#d1dbe4",
  "--ring": "#34495e",
} as CSSProperties;

function NavIcon({ to, label, icon, end }: { to: string; label: string; icon: (active: boolean) => ReactElement; end?: boolean }) {
  return (
    <NavLink to={to} end={end} className="flex flex-1 flex-col items-center gap-1 px-2 py-2 transition-all">
      {({ isActive }) => (
        <>
          {icon(isActive)}
          <span className="text-xs font-medium" style={{ color: isActive ? "var(--primary)" : "var(--muted-foreground)", fontSize: 10 }}>
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}

const journeyIcon = (active: boolean) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "var(--primary)" : "var(--muted-foreground)"} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3h6l2 3H21a1 1 0 010 2l-2 11H5L3 3z" />
  </svg>
);
const memoriesIcon = (active: boolean) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "var(--primary)" : "var(--muted-foreground)"} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);
const calendarIcon = (active: boolean) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "var(--primary)" : "var(--muted-foreground)"} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const reportIcon = (active: boolean) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "var(--primary)" : "var(--muted-foreground)"} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="9" y1="13" x2="15" y2="13" />
    <line x1="9" y1="17" x2="15" y2="17" />
  </svg>
);

export function Layout() {
  const { role, setRole } = useRole();
  const location = useLocation();
  const isCareCo = location.pathname.startsWith("/care-co");
  const isClinician = role === "clinician";

  return (
    <div className="flex min-h-screen justify-center bg-[#C9BFB0] sm:py-4">
      <div
        className="flex h-screen w-full max-w-md flex-col overflow-hidden bg-background sm:h-[calc(100vh-2rem)] sm:rounded-[2.5rem] sm:border sm:border-border sm:shadow-2xl"
        style={isClinician ? CLINICAL_VARS : undefined}
      >
        <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
          <Link to="/profile" className="flex items-center gap-2">
            <img src={lovedOne.photoUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
            <div className="leading-tight">
              <p className="font-serif text-base font-semibold text-foreground">Circle</p>
              <p className="text-xs text-muted-foreground">{lovedOne.preferredName}</p>
            </div>
          </Link>

          <div
            className="flex items-center gap-0.5 rounded-full border border-border bg-card p-1 font-semibold"
            style={{ fontSize: 10 }}
            title="Demo-only role switch — stands in for real authentication."
          >
            {ROLE_OPTIONS.map((opt) => (
              <button
                key={opt.role}
                type="button"
                onClick={() => setRole(opt.role)}
                className="rounded-full px-2 py-1 transition-colors"
                style={
                  role === opt.role
                    ? { background: "var(--primary)", color: "var(--primary-foreground)" }
                    : { color: "var(--muted-foreground)" }
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </header>

        <main className="relative flex-1 overflow-y-auto hide-scroll">
          <Outlet />
        </main>

        {isClinician ? (
          <nav className="flex flex-shrink-0 items-center justify-around border-t border-border bg-card" style={{ height: 64 }}>
            <NavIcon to="/report" label="Report" icon={reportIcon} end />
            <NavIcon to="/calendar" label="Calendar" icon={calendarIcon} />
          </nav>
        ) : (
          <nav className="relative flex-shrink-0" style={{ height: 72 }}>
            <div className="absolute inset-0 flex items-center justify-around px-2" style={{ background: "white", borderTop: "1px solid var(--border)" }}>
              <NavIcon to="/" label="Journey" icon={journeyIcon} end />
              <NavIcon to="/memories" label="Memories" icon={memoriesIcon} />
              <div className="w-14 flex-shrink-0" />
              {role === "admin" && <NavIcon to="/calendar" label="Calendar" icon={calendarIcon} />}
            </div>

            <div className="absolute left-1/2 -top-5 z-10 -translate-x-1/2">
              <Link to="/care-co" className="flex flex-col items-center">
                <span
                  className="flex h-14 w-14 items-center justify-center transition-all active:scale-95"
                  style={{
                    background: isCareCo ? "var(--ring)" : "var(--primary)",
                    borderRadius: 16,
                    transform: "rotate(45deg)",
                    boxShadow: "0 4px 16px rgba(74,123,106,0.4), 0 2px 4px rgba(0,0,0,0.15)",
                  }}
                >
                  <span style={{ transform: "rotate(-45deg)", color: "white", fontSize: 22, lineHeight: 1, display: "block" }}>◆</span>
                </span>
                <p className="mt-1 text-center text-xs font-medium" style={{ color: isCareCo ? "var(--primary)" : "var(--muted-foreground)", fontSize: 10, lineHeight: 1 }}>
                  Care Co.
                </p>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}
