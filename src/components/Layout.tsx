import { NavLink, Link, Outlet } from "react-router-dom";
import { useRole } from "../context/RoleContext";
import { lovedOne } from "../data/lovedOne";

const TABS = [
  { to: "/", end: true, icon: "🏠", label: "Home" },
  { to: "/timeline", icon: "📖", label: "Timeline" },
  { to: "/before-i-visit", icon: "🌤️", label: "Visit" },
  { to: "/profile", icon: "👤", label: "Profile" },
];

export function Layout() {
  const { role, setRole } = useRole();

  return (
    <div className="flex min-h-screen justify-center bg-warm-200/60 sm:py-4">
      <div className="flex h-screen w-full max-w-md flex-col overflow-hidden bg-warm-50 sm:h-[calc(100vh-2rem)] sm:rounded-[2.5rem] sm:border sm:border-warm-200 sm:shadow-2xl">
        <header className="flex shrink-0 items-center justify-between gap-2 border-b border-warm-200 bg-warm-50/95 px-4 py-3 backdrop-blur">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl" aria-hidden>
              🌿
            </span>
            <div className="leading-tight">
              <p className="font-display text-base font-semibold text-ink-900">Circle</p>
              <p className="text-xs text-ink-700">{lovedOne.preferredName}</p>
            </div>
          </Link>

          <div
            className="flex items-center gap-1 rounded-full border border-warm-200 bg-white p-1 text-xs font-semibold"
            title="Demo-only role switch — stands in for real authentication."
          >
            <button
              type="button"
              onClick={() => setRole("family")}
              className={`rounded-full px-2.5 py-1 transition-colors ${
                role === "family" ? "bg-sage-400 text-white" : "text-ink-700"
              }`}
            >
              Family
            </button>
            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`rounded-full px-2.5 py-1 transition-colors ${
                role === "admin" ? "bg-clinical-700 text-white" : "text-ink-700"
              }`}
            >
              Admin
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-5">
          <Outlet />
        </main>

        <nav className="flex shrink-0 items-stretch justify-around border-t border-warm-200 bg-white pb-[max(env(safe-area-inset-bottom),0.375rem)] pt-1.5">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-xs font-semibold transition-colors ${
                  isActive ? "text-coral-600" : "text-ink-500"
                }`
              }
            >
              <span className="text-lg" aria-hidden>
                {tab.icon}
              </span>
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
