import { NavLink, Outlet } from "react-router-dom";
import { useRole } from "../context/RoleContext";
import { lovedOne } from "../data/lovedOne";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
    isActive
      ? "bg-coral-500 text-white shadow-sm"
      : "text-ink-700 hover:bg-warm-100"
  }`;

export function Layout() {
  const { role, setRole } = useRole();

  return (
    <div className="min-h-screen bg-warm-50">
      <header className="border-b border-warm-200 bg-warm-50/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <NavLink to="/" className="flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <span className="font-display text-xl font-semibold text-ink-900">Circle</span>
            <span className="text-sm text-ink-700">· {lovedOne.preferredName}</span>
          </NavLink>

          <nav className="flex flex-wrap gap-1">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/timeline" className={navLinkClass}>
              Timeline
            </NavLink>
            <NavLink to="/ask" className={navLinkClass}>
              Ask
            </NavLink>
            <NavLink to="/before-i-visit" className={navLinkClass}>
              Before I Visit
            </NavLink>
          </nav>

          <div
            className="flex items-center gap-2 self-start rounded-full border border-warm-200 bg-white p-1 text-xs font-semibold sm:self-auto"
            title="Demo-only role switch — stands in for real authentication."
          >
            <button
              type="button"
              onClick={() => setRole("family")}
              className={`rounded-full px-3 py-1.5 transition-colors ${
                role === "family" ? "bg-sage-400 text-white" : "text-ink-700"
              }`}
            >
              Family view
            </button>
            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`rounded-full px-3 py-1.5 transition-colors ${
                role === "admin" ? "bg-clinical-700 text-white" : "text-ink-700"
              }`}
            >
              Admin view
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
