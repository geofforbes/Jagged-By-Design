import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { entries as seedEntries } from "../data/entries";
import type { KnowledgeEntry } from "../types";

interface EntriesContextValue {
  entries: KnowledgeEntry[];
  addEntry: (entry: KnowledgeEntry) => void;
  toggleApprove: (id: string) => void;
}

const EntriesContext = createContext<EntriesContextValue | null>(null);

export function EntriesProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<KnowledgeEntry[]>(seedEntries);

  const addEntry = useCallback((entry: KnowledgeEntry) => {
    setEntries((prev) => [entry, ...prev]);
  }, []);

  const toggleApprove = useCallback((id: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, clinicianApproved: !e.clinicianApproved } : e)),
    );
  }, []);

  const value = useMemo(() => ({ entries, addEntry, toggleApprove }), [entries, addEntry, toggleApprove]);
  return <EntriesContext.Provider value={value}>{children}</EntriesContext.Provider>;
}

export function useEntries(): EntriesContextValue {
  const ctx = useContext(EntriesContext);
  if (!ctx) throw new Error("useEntries must be used within an EntriesProvider");
  return ctx;
}
