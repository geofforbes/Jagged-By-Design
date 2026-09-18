import type { LovedOneProfile } from "../types";

export const lovedOne: LovedOneProfile = {
  name: "Margaret Hendricks",
  preferredName: "Nana",
  photoUrl:
    "https://images.unsplash.com/photo-1581579438747-104c53d7fbc4?q=80&w=800&auto=format&fit=crop",
  birthYear: 1943,
  lifeFacts: [
    { label: "Career", value: "District nurse in Leeds for over 30 years" },
    { label: "Later life", value: "Ran a florist on the high street for two decades" },
    { label: "Loves", value: "Her rose beds, and a proper pot of tea at 4pm" },
    { label: "Travel", value: "Took the family to Greece nearly every summer in the '90s" },
    { label: "Devoted to", value: "Leeds United, through thick and thin" },
    { label: "Met Bill", value: "At a dance hall in 1962 — married two years later" },
  ],
  circleOfCare: [
    { name: "Pete", relationship: "Son" },
    { name: "Sarah", relationship: "Daughter" },
    { name: "Ali", relationship: "Granddaughter (Sarah's daughter)" },
    { name: "Holly", relationship: "Granddaughter (Pete's daughter), lives in Sydney" },
    { name: "Denise", relationship: "Professional carer, visits weekdays" },
  ],
};
