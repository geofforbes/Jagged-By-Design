import { lovedOne } from "../data/lovedOne";
import { useRole } from "../context/RoleContext";

const currentYear = new Date().getFullYear();

export function ProfilePage() {
  const { role } = useRole();

  return (
    <div className="h-full overflow-y-auto px-5 pt-6 pb-8">
      <div className="mb-6 flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 text-center">
        <img
          src={lovedOne.photoUrl}
          alt={lovedOne.name}
          className="h-28 w-28 rounded-full object-cover"
          style={{ boxShadow: "0 0 0 4px rgba(196,113,78,0.2)" }}
        />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--accent)" }}>
            The centre of our circle
          </p>
          <h1 className="font-serif text-2xl font-bold text-foreground">{lovedOne.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {lovedOne.preferredName} · born {lovedOne.birthYear} (
            {currentYear - lovedOne.birthYear} years old)
          </p>
        </div>
      </div>

      <section className="mb-6">
        <h2 className="mb-3 font-serif text-lg font-semibold text-foreground">
          Who {lovedOne.preferredName} is
        </h2>
        <div className="space-y-2.5">
          {lovedOne.lifeFacts.map((fact) => (
            <div key={fact.label} className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--primary)" }}>
                {fact.label}
              </p>
              <p className="mt-1 text-sm text-secondary-foreground">{fact.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 font-serif text-lg font-semibold text-foreground">Circle of care</h2>
        <div className="flex flex-wrap gap-2">
          {lovedOne.circleOfCare.map((person) => (
            <span key={person.name} className="rounded-full bg-secondary px-3.5 py-1.5 text-sm text-secondary-foreground">
              <span className="font-semibold text-foreground">{person.name}</span> · {person.relationship}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 text-sm text-secondary-foreground">
        <p className="font-semibold text-foreground">
          Viewing as: {role === "admin" ? "Administrator" : "Family member"}
        </p>
        <p className="mt-1 text-muted-foreground">
          Use the switch in the header to preview how the app looks for an admin/caregiver versus
          a family member — this stands in for real sign-in in the prototype.
        </p>
      </section>
    </div>
  );
}
