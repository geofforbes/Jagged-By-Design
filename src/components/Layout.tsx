import { NavLink, Link, Outlet, useLocation } from "react-router-dom";
import { useRole } from "../context/RoleContext";
import { lovedOne } from "../data/lovedOne";

export function Layout() {
  const { role, setRole } = useRole();
  const location = useLocation();
  const isCareCo = location.pathname.startsWith("/care-co");

  return (
    <div className="flex min-h-screen justify-center bg-[#C9BFB0] sm:py-4">
      <div className="flex h-screen w-full max-w-md flex-col overflow-hidden bg-background sm:h-[calc(100vh-2rem)] sm:rounded-[2.5rem] sm:border sm:border-border sm:shadow-2xl">
        <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
          <Link to="/profile" className="flex items-center gap-2">
            <img src={lovedOne.photoUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
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

        <main className="relative flex-1 overflow-y-auto hide-scroll">
          <Outlet />
        </main>

        <nav className="relative flex-shrink-0" style={{ height: 72 }}>
          <div
            className="absolute inset-0 flex items-center justify-around px-2"
            style={{ background: "white", borderTop: "1px solid var(--border)" }}
          >
            <NavLink to="/" end className="flex flex-col items-center gap-1 px-4 py-2 transition-all">
              {({ isActive }) => (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isActive ? "var(--primary)" : "var(--muted-foreground)"} strokeWidth={isActive ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3h6l2 3H21a1 1 0 010 2l-2 11H5L3 3z" />
                  </svg>
                  <span className="text-xs font-medium" style={{ color: isActive ? "var(--primary)" : "var(--muted-foreground)", fontSize: 10 }}>
                    Journey
                  </span>
                </>
              )}
            </NavLink>

            <div className="w-16" />

            <NavLink to="/memories" className="flex flex-col items-center gap-1 px-4 py-2 transition-all">
              {({ isActive }) => (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isActive ? "var(--primary)" : "var(--muted-foreground)"} strokeWidth={isActive ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span className="text-xs font-medium" style={{ color: isActive ? "var(--primary)" : "var(--muted-foreground)", fontSize: 10 }}>
                    Memories
                  </span>
                </>
              )}
            </NavLink>
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
              <p
                className="mt-1 text-center text-xs font-medium"
                style={{ color: isCareCo ? "var(--primary)" : "var(--muted-foreground)", fontSize: 10, lineHeight: 1 }}
              >
                Care Co.
              </p>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}
