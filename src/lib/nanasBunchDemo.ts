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

// The real chat export's raw text. The actual photos and voice notes are
// never bundled into the app itself (see the "never commit these" rule in
// .gitignore - this is real, identifiable family/health data), so the
// WhatsApp mockup shows this thread with its normal media placeholders
// (waveform for audio, camera icon for photos) rather than the real files.
// Parsed with the exact same parseWhatsAppExport() a live .txt/.zip upload
// goes through, so "Skip to Furnished Demo" produces the same real
// conversation, just without a live upload's real photo blobs.
export const NANAS_BUNCH_CHAT_EXPORT = `29/08/26, 10:41 - Helen Lowe: <attached: IMG-2026-0829.jpg> Mom after breakfast in the courtyard. The care review says she is eating well and still likes walking to the dining room when she feels up to it.
29/08/26, 10:46 - Mark Bennett: Can they keep offering the walk and let her decide? She hates being rushed.
29/08/26, 10:50 - Helen Lowe: Yes, that's what we agreed.
29/08/26, 10:56 - Priya Bennett: <attached: PTT-2026-0829.opus>
29/08/26, 11:02 - Daniel Lowe: That sounded like a genuinely cheerful music session. Hearing Sally laugh and remember the chorus was lovely, even though she lost track of which day it was halfway through.
29/08/26, 15:18 - Priya Bennett: <attached: IMG-2026-0829-B.jpg> I dropped off pasties after music. Sally supervised the crimping and ate one while it was still warm.
03/09/26, 19:17 - Liam Bennett: <attached: PTT-2026-0903.opus>
03/09/26, 19:21 - Daniel Lowe: Hearing that Nana asked for help finding the red handbag while it was on the chair beside her does sound like another short-term memory lapse. At least she laughed when Liam pointed it out.
08/09/26, 08:29 - Helen Lowe: Mom called at six asking if the school bus had come. I think she was remembering when we were little. She settled after breakfast.
08/09/26, 08:33 - Mark Bennett: I can visit Friday before my meeting.
08/09/26, 08:35 - Zoe Bennett: I'll take Saturday. Maybe a cafe outing if she's up for it.
11/09/26, 16:58 - Helen Lowe: Weekend plan: Zoe Saturday morning, Mark Sunday lunch, me Sunday evening. Everyone else welcome, just message so we don't all arrive together.
11/09/26, 17:02 - Liam Bennett: I'll drive Zoe if my shift ends on time.
11/09/26, 17:05 - Zoe Bennett: You are not required as chauffeur, but yes please.
11/09/26, 17:12 - Priya Bennett: I'll make pasties for Sunday. She was asking about them last week.
12/09/26, 08:02 - Zoe Bennett: Morning. Rain looks like it might hold off. I'm thinking the little cafe by the nursery, not a long trip.
12/09/26, 08:06 - Helen Lowe: Sounds good. Let Mom choose when you get there.
12/09/26, 08:09 - Liam Bennett: Leaving at 9. I have petrol and a playlist, remarkable organisation for me.
12/09/26, 09:48 - Zoe Bennett: Nana was in her good blue shirt and asking where we were going before we even said hello.
12/09/26, 10:14 - Liam Bennett: She chose the cafe with the big windows. Told me the nursery one has wobbly chairs.
12/09/26, 11:06 - Zoe Bennett: Nana started singing along with the cafe radio. She said her mother used to play the song on Sundays, then asked me again which cafe we were in.
12/09/26, 11:11 - Ella Lowe: Hearing Nana sing was lovely. She sounded bright, and it was striking that she remembered her mother played that song on Sundays even though she asked twice which cafe you were in.
12/09/26, 11:16 - Priya Bennett: Did she eat anything?
12/09/26, 11:20 - Zoe Bennett: Half a scone and all the jam. Liam's coffee was judged "too fancy".
12/09/26, 11:22 - Liam Bennett: It was a flat white. I have no defence.
12/09/26, 12:44 - Zoe Bennett: Back at Willow House. She walked from the car to her room with me, slowly, and was pleased about it.
12/09/26, 12:49 - Helen Lowe: Lovely. Let her rest this afternoon.
12/09/26, 17:37 - Sam Lowe: Can someone ask Nana if she wants me to bring the card game tomorrow? I'm coming after lunch.
12/09/26, 17:42 - Zoe Bennett: She said "of course, if he can bear losing again".
12/09/26, 17:43 - Sam Lowe: Rude.
13/09/26, 08:17 - Priya Bennett: Pasties are in the oven. Please don't all eat them before Sally sees one.
13/09/26, 10:29 - Helen Lowe: Willow House rang. Mom was up early, asking to go to her own kitchen. They had breakfast with her and she's calm now.
13/09/26, 10:35 - Priya Bennett: I'll come with you and bring lunch.
13/09/26, 11:47 - Mark Bennett: She recognised us but is convinced there's a dinner party tonight. We didn't argue. She's telling Priya who needs inviting.
13/09/26, 11:52 - Priya Bennett: The guest list currently includes Mrs Jacobs and "that nice man from the post office".
13/09/26, 12:17 - Priya Bennett: She ate one pasty and picked all the pastry off the second. She's enjoying herself.
13/09/26, 13:08 - Mark Bennett: She got tired quickly after lunch and asked me to take her home. Staff helped her settle for a rest.
13/09/26, 13:16 - Sam Lowe: Should I skip cards today?
13/09/26, 13:19 - Mark Bennett: Maybe tomorrow, Sam. She was fading.
13/09/26, 18:22 - Helen Lowe: I sat with Mom for 20 mins. She was quiet and held my hand. She called me "my little girl" and then told me to put a jersey on.
13/09/26, 18:27 - Daniel Lowe: She has never stopped saying that to you.
13/09/26, 18:30 - Ella Lowe: How is she now?
13/09/26, 18:33 - Helen Lowe: Sleepy. Staff said they'd check on her after supper.
14/09/26, 07:56 - Ella Lowe: I'm doing the lunch visit today. Need anything dropped off?
14/09/26, 08:01 - Helen Lowe: Her glasses cloth and the green photo album, please. On the hall table.
14/09/26, 10:42 - Mark Bennett: Willow House called about Mom's feet looking puffy. Nurse is checking. They said she's comfortable.
14/09/26, 10:49 - Priya Bennett: Her slippers were tight on Saturday. Can someone get her new shoes? Soft, wide ones, because her feet are swollen.
14/09/26, 10:52 - Zoe Bennett: I can go after work. What size now?
14/09/26, 10:54 - Priya Bennett: Usually a 6 but maybe take a 7 to try. Don't guess from the box alone.
14/09/26, 12:18 - Ella Lowe: Here now. Nana is in the lounge doing a crossword with Mrs Jacobs. Feet are up on a stool. She says the clue for "small bird" is wrong.
14/09/26, 12:21 - Helen Lowe: Is she comfortable?
14/09/26, 12:26 - Ella Lowe: Says yes. Nurse will call you, she said. Nana wants to go to music tomorrow, so she is bargaining about the shoes.
14/09/26, 12:31 - Sam Lowe: I can come for cards at 3 if she's still up for it.
14/09/26, 14:07 - Sam Lowe: Cards were 15 minutes. She couldn't remember the rules at first, then accused me of changing them when she lost. So... normal?
14/09/26, 14:14 - Helen Lowe: Nurse rang. They're arranging a GP review tomorrow for the swelling. No distress today. Please keep an eye on how the shoes fit.
14/09/26, 15:38 - Zoe Bennett: <attached: IMG-2026-0914.jpg> Shop has these two wide pairs. Grey is softer, navy has a better sole. Thoughts?
14/09/26, 15:41 - Mark Bennett: Grey looks like something she'd wear. Can she get them on easily?
14/09/26, 15:45 - Priya Bennett: Grey. The strap opens much wider.
14/09/26, 15:47 - Helen Lowe: Please get both sizes if returnable. We'll fit them with Mom there.
14/09/26, 15:50 - Zoe Bennett: Done. Size 6 and 7 in grey. Receipt in the bag before anyone asks.
14/09/26, 15:54 - Daniel Lowe: You know this family too well.
14/09/26, 18:11 - Mark Bennett: Spoke to Mom. She asked why everyone was talking about her feet. I said because she has places to go.
14/09/26, 18:15 - Priya Bennett: She liked that?
14/09/26, 18:17 - Mark Bennett: She said "then don't buy ugly shoes".
15/09/26, 08:24 - Helen Lowe: GP at 11. I can be there. Mark, are you still taking the car for service?
15/09/26, 08:34 - Zoe Bennett: It's at my place. I'll leave it with reception at Willow House on my way to work.
15/09/26, 09:16 - Zoe Bennett: Shoes at reception, in a paper bag marked SALLY. Not the supermarket bag. That one is my lunch 🙃
15/09/26, 11:48 - Helen Lowe: GP has seen Mom. She'll send us the written note this afternoon; nurse is following the swelling. Mom mostly wanted to discuss the doctor's necklace.
15/09/26, 13:27 - Helen Lowe: The written note is in. Staff will follow the plan and let us know if anything changes. Mom was up for lunch and ate her pudding first.
15/09/26, 13:31 - Daniel Lowe: A sound choice.
15/09/26, 13:35 - Sam Lowe: Can I visit for music this afternoon or is that too much?
15/09/26, 13:39 - Helen Lowe: Ask the desk. She said she wanted music, but it's her call when you get there.
15/09/26, 16:18 - Sam Lowe: Music was good. She clapped out of time and told me I was doing it wrong. Didn't want to stay for tea, so I walked her back.
15/09/26, 16:22 - Zoe Bennett: That's a full afternoon for her.
15/09/26, 16:26 - Liam Bennett: Did she wear the new shoes?
15/09/26, 16:29 - Sam Lowe: Yes, but I didn't check the size. Grey. She said they made her look sensible.
15/09/26, 17:03 - Priya Bennett: They're the 7s. 6s are in her cupboard to return, please don't unpack them.
15/09/26, 17:07 - Helen Lowe: I'll take the 6s on Thursday. Put that on my list.
15/09/26, 20:14 - Mark Bennett: Mom just rang me twice to say she missed the bus. Staff say she's in her room and a bit unsettled.
15/09/26, 20:17 - Helen Lowe: I'll call her once, then let her rest.
15/09/26, 20:23 - Mark Bennett: Thanks.
15/09/26, 20:39 - Helen Lowe: She recognised my voice, asked if I had my coat. We talked about the rain. She was calmer by the end.
16/09/26, 08:01 - Helen Lowe: Willow House says Mom slept okay after 10. Breakfast was a bit slow. Liam, you're still visiting at 2?
16/09/26, 08:04 - Liam Bennett: Yes. My shift moved so I'll be there closer to 2:30.
16/09/26, 10:32 - Ella Lowe: Quick call with Nana. She thought I was her sister for a minute, then asked about my job. Could not remember where I worked, but remembered I hate the office coffee.
16/09/26, 10:40 - Ella Lowe: She sounded tired. I didn't keep her long.
16/09/26, 13:09 - Helen Lowe: Staff said she refused lunch at first because she was waiting for Mark. They sat with her and she ate some soup.
16/09/26, 13:13 - Mark Bennett: I hadn't said I was coming today. Maybe yesterday got muddled. I'll ring after Liam's visit, not during.
16/09/26, 14:46 - Liam Bennett: I'm here. She doesn't want to go outside, says the garden looks "wet and cross". We're looking at the old recipe books.
16/09/26, 15:04 - Liam Bennett: Quick update: Nana thought I had come to make her leave and kept asking where her bags were. I sat with her and we've got the recipe books out now. She's quieter, but I'm staying a bit longer.
16/09/26, 15:08 - Helen Lowe: Oh, that's hard. Hearing that she thought you had come to make her leave and kept asking where her bags were sounds much more confused and frightened than yesterday. Thanks for staying with her.
16/09/26, 15:12 - Daniel Lowe: That feels worth adding to the care notes. Can I come by with the radio, or is that too much today?
16/09/26, 15:15 - Liam Bennett: I think leave it. She got upset with two people in the room when the carer came in.
16/09/26, 15:18 - Daniel Lowe: Okay. Tomorrow.
16/09/26, 16:02 - Liam Bennett: Better now. We found the page with her handwriting in the margin. She showed me how to fold the pastry with a paper napkin.
16/09/26, 16:06 - Priya Bennett: That's such a Sally thing to do.
16/09/26, 16:10 - Mark Bennett: Did she eat anything after?
16/09/26, 16:13 - Liam Bennett: A biscuit and most of a banana. Staff are keeping an eye on supper.
16/09/26, 18:32 - Helen Lowe: Nurse says she ate some supper and is resting. We can keep tomorrow simple.
16/09/26, 18:35 - Zoe Bennett: I was planning my lunch visit. Can swap with anyone if she needs a quiet morning.
16/09/26, 18:39 - Helen Lowe: Go if she's up to it. No pressure for an outing.
16/09/26, 18:42 - Ben Lowe: I can fix the digital frame Saturday; it keeps restarting. No one needs to do that tomorrow.
17/09/26, 08:18 - Zoe Bennett: Desk says Nana had breakfast and is asking about the garden. I'll go at 11.
17/09/26, 08:21 - Helen Lowe: Good. I'll drop off the album and collect the size 6 shoes on my way to work.
17/09/26, 09:16 - Helen Lowe: Shoes collected, album delivered. Size 7s seem comfortable according to the nurse.
17/09/26, 11:28 - Zoe Bennett: She's in the garden, cardigan on, telling me where the sun used to hit her old kitchen window.
17/09/26, 11:35 - Zoe Bennett: She said yes and then told me to move because I was casting a shadow 😄
17/09/26, 11:58 - Zoe Bennett: We sat out for a while. She picked the purple flowers for the picture and gave us her first proper smile today.
17/09/26, 12:01 - Helen Lowe: That smile ❤️
17/09/26, 12:11 - Liam Bennett: Looks brighter than yesterday. Give her a squeeze from me if she's okay with it.
17/09/26, 12:18 - Zoe Bennett: She was. She asked who sent it, I said Liam, and she said "the tall one who eats too fast?".
17/09/26, 12:20 - Liam Bennett: Fair.
17/09/26, 12:44 - Zoe Bennett: She walked back in with her walker. Stopped halfway because a bird was on the path. I didn't hurry her.
17/09/26, 12:48 - Helen Lowe: Thank you. Those little walks matter to her.
17/09/26, 14:23 - Mark Bennett: Can someone take Mom to the hairdresser next week? She mentioned it to me on the phone.
17/09/26, 14:27 - Ella Lowe: Tuesday lunch? I can take leave for an hour if the salon has a slot.
17/09/26, 14:31 - Helen Lowe: I'll call the salon and the desk, then confirm. Don't book leave yet.
17/09/26, 14:35 - Priya Bennett: She also asked me for the pink nail polish. I'll bring it Saturday.
17/09/26, 14:39 - Ben Lowe: And I'm doing the frame Saturday. I'll need the wifi password again because I have lost it for the third time.
17/09/26, 14:44 - Ben Lowe: I stand by it.
17/09/26, 18:06 - Helen Lowe: Salon can do Tuesday at 12. Staff can have her ready, Ella can take her if Mom feels like going that morning.
17/09/26, 18:10 - Ella Lowe: Yes, I'll hold the time. I'll make it a haircut and a coffee if she's got the energy.
17/09/26, 18:13 - Mark Bennett: Good. She likes having a plan, even if we change it.
18/09/26, 07:39 - Helen Lowe: Morning. Nurse says swelling is a little better today and Mom was awake early. She asked to choose her own top for breakfast.
18/09/26, 07:43 - Priya Bennett: Of course she did. Did she pick the blue one?
18/09/26, 07:47 - Helen Lowe: The green one. Apparently blue is "for going out".
18/09/26, 08:14 - Mark Bennett: I can do an afternoon visit after 3. Might take her downstairs for tea if she wants.
18/09/26, 08:18 - Helen Lowe: Great. I have a call at 4, so I can't go today.
18/09/26, 09:07 - Priya Bennett: Returned the size 6 shoes. Got the full refund. I am keeping the receipt photo because no one believes I can return things on time.
18/09/26, 10:26 - Ella Lowe: Nana called me "the yellow kitchen one" this morning. Then asked me to bring lemon biscuits for Tuesday. I think I'm identifiable enough.
18/09/26, 10:34 - Ella Lowe: She also wanted to know if the dog is coming to the haircut. So we're not fully across Tuesday's plan yet.
18/09/26, 10:38 - Helen Lowe: We'll talk her through it on the day. Lemon biscuits are an excellent idea.
18/09/26, 11:59 - Zoe Bennett: Can we pencil in Sunday garden tea? Forecast looks decent. I can bring a flask and the photo album.
18/09/26, 12:08 - Liam Bennett: I can do transport and carry the flask. No flat whites, promise.
18/09/26, 12:15 - Helen Lowe: Let's check with Mom on Sunday morning. She may want quiet. But lovely to have the option.
18/09/26, 15:17 - Mark Bennett: At Willow House. Mom recognised me straight away, then asked if I had done my homework.
18/09/26, 15:24 - Mark Bennett: I told her I had. She said she'd check.
18/09/26, 15:36 - Mark Bennett: She chose tea downstairs and walked with the frame. Wanted to stop and talk to Mrs Jacobs on the way.
18/09/26, 15:41 - Helen Lowe: How are the shoes after a walk?
18/09/26, 15:45 - Mark Bennett: Fine. She says they look like "proper walking shoes" now. No pinching that she mentioned.
18/09/26, 16:02 - Mark Bennett: She got muddled about where we were going on the way back and asked me to take her to the bus stop. We sat for a bit by the piano. She calmed down when someone started playing.
18/09/26, 16:10 - Mark Bennett: A little, for a few minutes. Then she wanted me to help find the tune. She hummed the start and I had no idea, as usual.
18/09/26, 16:18 - Mark Bennett: She was. Told me I need to listen properly.
18/09/26, 17:04 - Mark Bennett: Back in her room now. She chose the green top for tomorrow as well. Staff have the GP note and are checking her feet as planned.
18/09/26, 17:09 - Priya Bennett: Thanks. I'll call the desk before Sunday, and can take a short visit tomorrow if she wants one.
18/09/26, 17:17 - Ella Lowe: I'll do Tuesday hair and lemon biscuits. If she changes her mind, we can just have the biscuits.
18/09/26, 17:21 - Ben Lowe: Frame Saturday. Wifi password under it. I have written this down.
18/09/26, 17:24 - Daniel Lowe: I'll believe that when I see it.
18/09/26, 17:29 - Zoe Bennett: Sunday is a maybe, then. Purple flowers and tea if she feels like it.
18/09/26, 17:33 - Helen Lowe: Exactly. We can ask her in the morning. ❤️`;

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
