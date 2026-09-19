import type { DemoResults } from "../components/ResultsPreview";

/**
 * Curated, hand-built structured output for the exact "Nana's Bunch" chat
 * export (Sally / Helen Lowe / Willow House family) the user confirmed is
 * the one actual file used in the live demo. This mirrors the content the
 * design team baked into their own updated app bundle (a Figma Make export
 * with this same chat's real content already written in) - so the numbers,
 * wording and categories here are chosen to match that bundle exactly, not
 * derived independently.
 *
 * photo_url is left null here and filled in at runtime in DemoPage.tsx from
 * the real zip's own attachment blobs, matched by attachmentFilename - the
 * same mechanism used for any other zip upload.
 */
export const NANAS_BUNCH_MARKER_SENDERS = ["Helen Lowe", "Zoe Bennett"];

export const NANAS_BUNCH_LOVED_ONE = "Sally";
export const NANAS_BUNCH_ALIASES = ["Nana", "Mom", "Mum"];

export const NANAS_BUNCH_PHOTO_ATTACHMENTS: Record<number, string> = {
  7: "IMG-2026-0829.jpg",
  9: "IMG-2026-0829-B.jpg",
  13: "IMG-2026-0914.jpg",
};

export interface LogEvent {
  id: number;
  date: string;
  occurred_at: string;
  category: string;
  title: string;
}

export interface ActionItem {
  id: number;
  title: string;
  detail: string;
  priority: "Urgent" | "This week" | "Ongoing";
  source: string;
  done: boolean;
  tag: string;
}

export interface PromptTopic {
  category: string;
  emoji: string;
  prompts: { prompt: string; context: string }[];
}

export interface KeyContact {
  name: string;
  role: string;
  phone: string;
}

export const LOG_EVENTS: LogEvent[] = [
  { id: 1, date: "29 Aug 2026", occurred_at: "2026-08-29", category: "Family", title: "Breakfast in the courtyard — walking well, eating well" },
  { id: 2, date: "29 Aug 2026", occurred_at: "2026-08-29", category: "Positive", title: "Cheerful music session — remembered the chorus, lost track of the day" },
  { id: 3, date: "29 Aug 2026", occurred_at: "2026-08-29", category: "Positive", title: "Supervised pasty-crimping with Priya, ate one warm" },
  { id: 4, date: "3 Sep 2026", occurred_at: "2026-09-03", category: "Cognitive", title: "Asked for help finding her handbag — it was beside her" },
  { id: 5, date: "8 Sep 2026", occurred_at: "2026-09-08", category: "Cognitive", title: "Early call asking if the school bus had come; settled after breakfast" },
  { id: 6, date: "12 Sep 2026", occurred_at: "2026-09-12", category: "Positive", title: "Café outing — chose the table with big windows, sang along to the radio" },
  { id: 7, date: "12 Sep 2026", occurred_at: "2026-09-12", category: "Family", title: "Walked from car to room slowly with Zoe, pleased about it" },
  { id: 8, date: "13 Sep 2026", occurred_at: "2026-09-13", category: "Cognitive", title: "Convinced a dinner party was happening; planned a guest list" },
  { id: 9, date: "13 Sep 2026", occurred_at: "2026-09-13", category: "Health", title: "Tired quickly after lunch, asked to go home and rest" },
  { id: 10, date: "13 Sep 2026", occurred_at: "2026-09-13", category: "Positive", title: "Quiet moment holding Helen's hand, called her \"my little girl\"" },
  { id: 11, date: "14 Sep 2026", occurred_at: "2026-09-14", category: "Health", title: "Feet noted as puffy — nurse checking, shoes ordered" },
  { id: 12, date: "14 Sep 2026", occurred_at: "2026-09-14", category: "Social", title: "Doing a crossword with Mrs Jacobs, feet up on a stool" },
  { id: 13, date: "14 Sep 2026", occurred_at: "2026-09-14", category: "Cognitive", title: "Cards cut short — couldn't recall the rules, then accused Sam of changing them" },
  { id: 14, date: "15 Sep 2026", occurred_at: "2026-09-15", category: "Health", title: "GP review for swelling — written care plan issued" },
  { id: 15, date: "15 Sep 2026", occurred_at: "2026-09-15", category: "Positive", title: "Music afternoon with Sam — clapped out of time, in good spirits" },
  { id: 16, date: "15 Sep 2026", occurred_at: "2026-09-15", category: "Cognitive", title: "Rang twice in the evening believing she'd missed the bus, unsettled" },
  { id: 17, date: "16 Sep 2026", occurred_at: "2026-09-16", category: "Cognitive", title: "Refused lunch waiting for Mark, muddled about the day" },
  { id: 18, date: "16 Sep 2026", occurred_at: "2026-09-16", category: "Cognitive", title: "Distressed during Liam's visit — thought she was being made to leave" },
  { id: 19, date: "16 Sep 2026", occurred_at: "2026-09-16", category: "Positive", title: "Settled with old recipe books, showed how to fold pastry with a napkin" },
  { id: 20, date: "17 Sep 2026", occurred_at: "2026-09-17", category: "Positive", title: "Garden time, picked purple flowers, first proper smile of the day" },
  { id: 21, date: "17 Sep 2026", occurred_at: "2026-09-17", category: "Family", title: "Walked back with her walker, paused for a bird, unhurried" },
  { id: 22, date: "18 Sep 2026", occurred_at: "2026-09-18", category: "Positive", title: "Chose her own green top at breakfast" },
  { id: 23, date: "18 Sep 2026", occurred_at: "2026-09-18", category: "Positive", title: "Recognised Mark immediately, asked if he'd done his homework" },
  { id: 24, date: "18 Sep 2026", occurred_at: "2026-09-18", category: "Cognitive", title: "Muddled on the way back, asked for the bus stop; calmed by piano music" },
];

export const INITIAL_ACTIONS: ActionItem[] = [
  { id: 1, title: "Confirm outcome of GP swelling review", detail: "GP saw Sally on 15 Sep for foot swelling and issued a written care plan; nurse is monitoring. Confirm with the desk if anything changes.", priority: "Urgent", source: "Helen Lowe · 15 Sep", done: false, tag: "Health" },
  { id: 2, title: "Return spare size 6 shoes", detail: "Priya returned the size 6 pair and got a full refund on 18 Sep. Keeping the receipt photo on file.", priority: "Urgent", source: "Priya Bennett · 18 Sep", done: true, tag: "Admin" },
  { id: 3, title: "Reconfirm Tuesday hairdresser slot", detail: "Salon booked for 12pm Tuesday. Ella will take her if she's up for it on the day — check with the desk beforehand.", priority: "This week", source: "Helen Lowe · 17 Sep", done: false, tag: "Family" },
  { id: 4, title: "Bring lemon biscuits for Tuesday", detail: "Sally asked Ella for lemon biscuits ahead of the haircut — a nice small thing to bring along.", priority: "This week", source: "Ella Lowe · 18 Sep", done: false, tag: "Wellbeing" },
  { id: 5, title: "Fix the digital photo frame", detail: "It keeps restarting. Ben is looking at it Saturday — remember the wifi password.", priority: "This week", source: "Ben Lowe · 18 Sep", done: false, tag: "Admin" },
  { id: 6, title: "Offer the courtyard walk, let her set the pace", detail: "She still enjoys walking to the dining room when she feels up to it. Never rush her — she notices and dislikes it.", priority: "Ongoing", source: "Family observation", done: false, tag: "Wellbeing" },
  { id: 7, title: "Sit with her through confused or distressed moments", detail: "Staying present and finding something familiar — recipe books, a photo, music — helps her settle when she's disoriented.", priority: "Ongoing", source: "Family observation", done: false, tag: "Wellbeing" },
];

export const STARTER_TOPICS: PromptTopic[] = [
  { category: "Kitchen", emoji: "🥧", prompts: [
    { prompt: "Show me how you fold the pastry", context: "She showed Liam how to fold pastry with a paper napkin, from notes in her own handwriting in an old recipe book — a lovely hands-on activity." },
    { prompt: "What's the secret to your pasties?", context: "She supervises the crimping when Priya brings pasties round, and enjoys the ritual of it as much as eating one warm." },
    { prompt: "Tell me about your kitchen at home", context: "She's asked staff to take her to her own kitchen before — reminiscing about it in conversation can be grounding." },
  ]},
  { category: "Music", emoji: "🎵", prompts: [
    { prompt: "Shall we put some music on?", context: "Music sessions are consistently cheerful — she sings along and claps, even if not quite in time." },
    { prompt: "Do you remember this one from Sunday mornings?", context: "At a café she sang along to the radio and recalled her mother playing a song on Sundays." },
    { prompt: "Can you hum the tune for me?", context: "She often hums the start of a song and enjoys the game of someone trying to guess it." },
  ]},
  { category: "Garden", emoji: "🌸", prompts: [
    { prompt: "Shall we sit outside for a bit?", context: "Garden time with purple flowers produced her first proper smile of the day on 17 Sep." },
    { prompt: "Tell me about your old kitchen window", context: "In the garden she described exactly where the sun used to hit her old kitchen window — a vivid, calm memory." },
    { prompt: "Want to watch for birds on the path?", context: "She once paused mid-walk to watch a bird — unhurried outdoor time suits her well." },
  ]},
  { category: "Family", emoji: "👨‍👩‍👧", prompts: [
    { prompt: "Who's coming to the party tonight?", context: "She sometimes believes a dinner party is happening and enjoys planning the guest list — going along with it works well." },
    { prompt: "Fancy a game of cards?", context: "Cards are a regular visit activity, even when the rules get reinvented partway through." },
    { prompt: "Did you catch the school bus this morning?", context: "Some early mornings she asks about the school bus — a gentle sign she's remembering raising her own kids." },
  ]},
];

export const KEY_CONTACTS: KeyContact[] = [
  { name: "Helen Lowe", role: "Daughter", phone: "072 555 0114" },
  { name: "Mark Bennett", role: "Son", phone: "082 555 0192" },
  { name: "Willow House", role: "Reception & nursing desk", phone: "021 555 0300" },
  { name: "Emergency", role: "Ambulance / Police", phone: "112" },
];

export function buildNanasBunchResults(): DemoResults {
  return {
    care: [
      {
        id: 1,
        insight_category: "Cognitive",
        severity: "High",
        title: "Marked confusion and distress during an afternoon visit",
        body: "During Liam's visit, Sally believed she was being made to leave and repeatedly asked where her bags were. She became more upset when a second person (the carer) entered the room, and was noticeably more frightened than the day before. She settled once occupied with an old recipe book. Family felt this was worth flagging to the care team.",
        occurred_at: "2026-09-16T15:04:00Z",
        person_name: "Liam Bennett",
      },
      {
        id: 2,
        insight_category: "Health",
        severity: "Medium",
        title: "Swollen feet — new shoes fitted, GP review completed",
        body: "Willow House flagged puffy feet on 14 Sep; her slippers were tight. Wider, softer shoes were bought and fitted. GP saw her on 15 Sep, a written care plan was issued, and swelling was reported a little better by 18 Sep. Nursing staff continue to monitor.",
        occurred_at: "2026-09-15T11:48:00Z",
        person_name: "Helen Lowe",
      },
      {
        id: 3,
        insight_category: "Positive",
        severity: "Positive",
        title: "Café outing and garden time both lifted her mood",
        body: "A café trip on 12 Sep had her singing along to the radio and choosing the table by the big windows. On 17 Sep she picked purple flowers in the garden and gave the family \"her first proper smile today.\" Both outings were unhurried and led by her.",
        occurred_at: "2026-09-17T11:58:00Z",
        person_name: "Zoe Bennett",
      },
      {
        id: 4,
        insight_category: "Cognitive",
        severity: "Low",
        title: "Short-term memory lapses noted in voice updates",
        body: "In a voice note from the music session (29 Aug) she lost track of what day it was, though she was cheerful throughout. On 3 Sep she asked for help finding her red handbag while it was on the chair beside her, and laughed when it was pointed out.",
        occurred_at: "2026-09-03T19:17:00Z",
        person_name: "Liam Bennett",
      },
      {
        id: 5,
        insight_category: "Positive",
        severity: "Positive",
        title: "Recognised family immediately and chose her own routine",
        body: "Sally recognised Mark straight away this afternoon, chose her own top at breakfast, and calmed quickly when someone started playing the piano downstairs. A settled, good day overall.",
        occurred_at: "2026-09-18T15:17:00Z",
        person_name: "Mark Bennett",
      },
      {
        id: 6,
        insight_category: "Social",
        severity: "Low",
        title: "Occasional disorientation about time of day and identity of visitors",
        body: "Sally has called Helen \"my little girl\", asked about the school bus at six in the morning, mistaken Ella for a relative before recognising her voice, and once believed a dinner party was happening that evening (and started planning the guest list). Family are gently going along with these moments rather than correcting her.",
        occurred_at: "2026-09-16T10:32:00Z",
        person_name: "Ella Lowe",
      },
    ],
    lifeStory: [
      {
        id: 7,
        occurred_at: "2026-08-29T10:41:00Z",
        era_label: null,
        summary: "Mom after breakfast in the courtyard. She's eating well and still likes walking to the dining room when she feels up to it.",
        person_name: "Helen Lowe",
        photo_url: null,
      },
      {
        id: 8,
        occurred_at: "2026-08-29T10:56:00Z",
        era_label: null,
        summary: "A genuinely cheerful music session — Sally laughed and remembered the chorus, even though she lost track of what day it was halfway through.",
        person_name: "Priya Bennett",
        photo_url: null,
        is_bite: true,
      },
      {
        id: 9,
        occurred_at: "2026-08-29T15:18:00Z",
        era_label: null,
        summary: "Dropped off pasties after music. Sally supervised the crimping and ate one while it was still warm.",
        person_name: "Priya Bennett",
        photo_url: null,
      },
      {
        id: 10,
        occurred_at: "2026-09-03T19:17:00Z",
        era_label: null,
        summary: "Nana asked for help finding her red handbag — it was on the chair right beside her the whole time. She laughed when Liam pointed it out.",
        person_name: "Liam Bennett",
        photo_url: null,
        is_bite: true,
      },
      {
        id: 13,
        occurred_at: "2026-09-14T15:38:00Z",
        era_label: null,
        summary: "Two wide-fit options from the shop for her swollen feet. Went with the grey pair — the strap opens much wider.",
        person_name: "Zoe Bennett",
        photo_url: null,
      },
    ],
    calendar: [
      {
        id: 14,
        title: "Liam visiting — recipe books",
        item_type: "visit",
        due_at: "2026-09-16",
        due_time: "14:30",
        notes: null,
        person_name: "Liam Bennett",
      },
      {
        id: 15,
        title: "Zoe — garden time",
        item_type: "visit",
        due_at: "2026-09-17",
        due_time: "11:00",
        notes: null,
        person_name: "Zoe Bennett",
      },
      {
        id: 16,
        title: "Mark visiting — tea downstairs",
        item_type: "visit",
        due_at: "2026-09-18",
        due_time: "15:00",
        notes: null,
        person_name: "Mark Bennett",
      },
      {
        id: 17,
        title: "Hairdresser with Ella + coffee",
        item_type: "appointment",
        due_at: "2026-09-19",
        due_time: "12:00",
        notes: null,
        person_name: "Ella Lowe",
      },
      {
        id: 18,
        title: "Nurse — swelling check-in",
        item_type: "appointment",
        due_at: "2026-09-20",
        due_time: "10:00",
        notes: null,
        person_name: "Helen Lowe",
      },
      {
        id: 19,
        title: "Ben fixing the digital photo frame",
        item_type: "task",
        due_at: "2026-09-21",
        due_time: "10:00",
        notes: null,
        person_name: "Ben Lowe",
      },
      {
        id: 20,
        title: "Garden tea with Zoe & Liam (tentative)",
        item_type: "visit",
        due_at: "2026-09-22",
        due_time: "15:00",
        notes: "Weather permitting - check with Sally on the morning.",
        person_name: "Zoe Bennett",
      },
    ],
  };
}
