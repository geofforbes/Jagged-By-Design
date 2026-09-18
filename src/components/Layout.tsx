import type { ReactElement } from "react";
import { NavLink, Link, Outlet } from "react-router-dom";
import { useRole } from "../context/RoleContext";
import { lovedOne } from "../data/lovedOne";

const NAV_ICONS: Record<string, (active: boolean) => ReactElement> = {
  home: (active) => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  timeline: (active) => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  ask: (active) => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  memories: (active) => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
};

const TABS = [
  { to: "/", end: true, key: "home", label: "Today" },
  { to: "/timeline", key: "timeline", label: "Journey" },
  { to: "/before-i-visit", key: "visit", label: "Visit" },
  { to: "/ask", key: "ask", label: "Ask" },
  { to: "/memories", key: "memories", label: "Memories" },
];

export function Layout() {
  const { role, setRole } = useRole();

  return (
    <div className="flex min-h-screen justify-center bg-[#E8E4DF] sm:py-4">
      <div className="flex h-screen w-full max-w-md flex-col overflow-hidden bg-background sm:h-[calc(100vh-2rem)] sm:rounded-[2.5rem] sm:border sm:border-border sm:shadow-2xl">
        <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
          <Link to="/profile" className="flex items-center gap-2">
            <img
              src={lovedOne.photoUrl}
              alt=""
              className="h-8 w-8 rounded-full object-cover"
            />
            <div className="leading-tight">
              <p className="font-serif text-base font-semibold text-foreground">Circle</p>
              <p className="text-xs text-muted-foreground">{lovedOne.preferredName}</p>
            </div>
          </Link>

          <div
            className="flex items-center gap-1 rounded-full border border-border bg-card p-1 text-xs font-semibold"
            title="Demo-only role switch — stands in for real authentication."
          >
            <button
              type="button"
              onClick={() => setRole("family")}
              className="rounded-full px-2.5 py-1 transition-colors"
              style={role === "family" ? { background: "var(--primary)", color: "var(--primary-foreground)" } : { color: "var(--muted-foreground)" }}
            >
              Family
            </button>
            <button
              type="button"
              onClick={() => setRole("admin")}
              className="rounded-full px-2.5 py-1 transition-colors"
              style={role === "admin" ? { background: "var(--foreground)", color: "var(--background)" } : { color: "var(--muted-foreground)" }}
            >
              Admin
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

        <nav
          className="flex shrink-0 items-end justify-around px-2 pt-2"
          style={{
            background: "rgba(248,245,241,0.95)",
            backdropFilter: "blur(20px)",
            borderTop: "1px solid var(--border)",
            paddingBottom: "max(env(safe-area-inset-bottom), 0.75rem)",
          }}
        >
          {TABS.map((tab) => {
            const isCenter = tab.key === "visit";
            if (isCenter) {
              return (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  className="flex flex-1 flex-col items-center gap-1"
                >
                  <span
                    className="-mt-5 flex h-10 w-10 items-center justify-center rounded-full shadow-lg"
                    style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                </NavLink>
              );
            }
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className="flex flex-1 flex-col items-center gap-1 transition-opacity"
              >
                {({ isActive }) => (
                  <>
                    <span style={{ color: isActive ? "var(--primary)" : "var(--foreground)", opacity: isActive ? 1 : 0.5 }}>
                      {NAV_ICONS[tab.key](isActive)}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: isActive ? "var(--primary)" : "var(--muted-foreground)", fontWeight: isActive ? 600 : 400 }}
                    >
                      {tab.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
