import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { calendarPlans } from "../data/calendarPlans";
import type { DayPlan, RestrictionCategory } from "../types";

interface CalendarContextValue {
  plans: DayPlan[];
  getPlan: (date: string) => DayPlan | undefined;
  setRestriction: (date: string, category: RestrictionCategory, restricted: boolean, setBy: string) => void;
}

const CalendarContext = createContext<CalendarContextValue | null>(null);

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [plans, setPlans] = useState<DayPlan[]>(calendarPlans);

  const getPlan = useCallback((date: string) => plans.find((p) => p.date === date), [plans]);

  const setRestriction = useCallback(
    (date: string, category: RestrictionCategory, restricted: boolean, setBy: string) => {
      setPlans((prev) => {
        const existing = prev.find((p) => p.date === date);
        if (existing) {
          return prev.map((p) =>
            p.date === date ? { ...p, restrictions: { ...p.restrictions, [category]: restricted }, setBy } : p,
          );
        }
        return [...prev, { date, restrictions: { [category]: restricted }, setBy }];
      });
    },
    [],
  );

  const value = useMemo(() => ({ plans, getPlan, setRestriction }), [plans, getPlan, setRestriction]);
  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>;
}

export function useCalendar(): CalendarContextValue {
  const ctx = useContext(CalendarContext);
  if (!ctx) throw new Error("useCalendar must be used within a CalendarProvider");
  return ctx;
}
