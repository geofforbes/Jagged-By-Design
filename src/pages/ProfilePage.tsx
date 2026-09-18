import { lovedOne } from "../data/lovedOne";
import { useRole } from "../context/RoleContext";

const currentYear = new Date().getFullYear();

export function ProfilePage() {
  const { role } = useRole();

  return (
    <div className="space-y-8">
      <section className="flex flex-col items-center gap-4 rounded-3xl bg-white p-6 text-center shadow-sm">
        <img
          src={lovedOne.photoUrl}
          alt={lovedOne.name}
          className="h-28 w-28 rounded-full object-cover ring-4 ring-coral-200"
        />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-coral-600">
            The centre of our circle
          </p>
          <h1 className="font-display text-2xl font-bold text-ink-900">{lovedOne.name}</h1>
          <p className="mt-1 text-sm text-ink-700">
            {lovedOne.preferredName} · born {lovedOne.birthYear} (
            {currentYear - lovedOne.birthYear} years old)
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold text-ink-900">
          Who {lovedOne.preferredName} is
        </h2>
        <div className="space-y-2.5">
          {lovedOne.lifeFacts.map((fact) => (
            <div key={fact.label} className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-sage-600">
                {fact.label}
              </p>
              <p className="mt-1 text-sm text-ink-800">{fact.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold text-ink-900">Circle of care</h2>
        <div className="flex flex-wrap gap-2">
          {lovedOne.circleOfCare.map((person) => (
            <span
              key={person.name}
              className="rounded-full bg-warm-100 px-3.5 py-1.5 text-sm text-ink-700"
            >
              <span className="font-semibold text-ink-900">{person.name}</span> · {person.relationship}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-warm-200 bg-white p-4 text-sm text-ink-700">
        <p className="font-semibold text-ink-900">Viewing as: {role === "admin" ? "Administrator" : "Family member"}</p>
        <p className="mt-1">
          Use the switch in the header to preview how the app looks for an admin/caregiver versus
          a family member — this stands in for real sign-in in the prototype.
        </p>
      </section>
    </div>
  );
}
