import { Link } from "react-router-dom";
import { lovedOne } from "../data/lovedOne";

const currentYear = new Date().getFullYear();

const quickLinks = [
  {
    to: "/timeline",
    icon: "📖",
    title: "Family timeline",
    body: "Visits, photos, moods and moments — the story of the last few weeks.",
  },
  {
    to: "/ask",
    icon: "💬",
    title: "Ask",
    body: `Ask anything about how ${lovedOne.preferredName} has been doing.`,
  },
  {
    to: "/before-i-visit",
    icon: "🌤️",
    title: "Before I Visit",
    body: "Get a warm catch-up and gentle conversation ideas before you go.",
  },
];

export function HomePage() {
  return (
    <div className="space-y-10">
      <section className="flex flex-col items-center gap-6 rounded-3xl bg-white p-8 text-center shadow-sm sm:flex-row sm:text-left">
        <img
          src={lovedOne.photoUrl}
          alt={lovedOne.name}
          className="h-32 w-32 rounded-full object-cover ring-4 ring-coral-200 sm:h-40 sm:w-40"
        />
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-coral-600">
            The centre of our circle
          </p>
          <h1 className="font-display text-3xl font-bold text-ink-900 sm:text-4xl">
            {lovedOne.name}
          </h1>
          <p className="mt-1 text-ink-700">
            {lovedOne.preferredName} · born {lovedOne.birthYear} ({currentYear - lovedOne.birthYear}{" "}
            years old)
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl font-semibold text-ink-900">
          Who {lovedOne.preferredName} is
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {lovedOne.lifeFacts.map((fact) => (
            <div key={fact.label} className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-sage-600">
                {fact.label}
              </p>
              <p className="mt-1 text-ink-800">{fact.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl font-semibold text-ink-900">Circle of care</h2>
        <div className="flex flex-wrap gap-2">
          {lovedOne.circleOfCare.map((person) => (
            <span
              key={person.name}
              className="rounded-full bg-warm-100 px-4 py-2 text-sm text-ink-700"
            >
              <span className="font-semibold text-ink-900">{person.name}</span> · {person.relationship}
            </span>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {quickLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="rounded-2xl border border-warm-200 bg-white p-5 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="text-2xl">{link.icon}</div>
            <h3 className="mt-2 font-display text-lg font-semibold text-ink-900">{link.title}</h3>
            <p className="mt-1 text-sm text-ink-700">{link.body}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
