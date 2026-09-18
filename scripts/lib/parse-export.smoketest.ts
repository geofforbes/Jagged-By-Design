import { parseWhatsAppExport } from "./parse-export.js";

const iosSample = `[15/01/2024, 09:15:32] Sarah: Had coffee with Mum this morning. She was really happy but kept asking where Peter was.
[15/01/2024, 09:16:01] Sarah: <attached: 00000012-PHOTO-2024-01-15-09-16-00.jpg>
[15/01/2024, 18:02:10] Pete: Taking her to Dr. Patel on Tuesday, she's been forgetting her pills again.
This is a follow up on the confusion from last week.
[16/01/2024, 08:00:00] Sarah: ‎image omitted`;

const androidSample = `15/01/2024, 9:15 am - Sarah: Had coffee with Mum this morning.
15/01/2024, 9:16 am - Sarah: IMG-20240115-WA0001.jpg (file attached)`;

// Real-world format seen in an actual export: year-first, dash separator, no
// seconds, plus system notices (no colon) that must be skipped, not glued.
const yearFirstWithSystemNoticesSample = `2016/05/22, 19:11 - Lorna Forbes created group "Stilbaai weekend"
2016/05/22, 19:11 - Lorna Forbes added you
2016/05/22, 19:13 - Lorna Forbes: Hi guys-house confirmed for 1-4 July.
2016/06/27, 21:49 - Messages and calls are end-to-end encrypted. Only people in this chat can read, listen to, or share them. *Learn more*
2016/07/05, 10:11 - Christina King left
2017/02/15, 10:51 - Lorna Forbes: PTT-20170215-WA0000.opus (file attached)
2017/03/15, 19:14 - Ali Bruce: <Media omitted>`;

console.log("--- iOS ---");
console.log(JSON.stringify(parseWhatsAppExport(iosSample), null, 2));
console.log("--- Android ---");
console.log(JSON.stringify(parseWhatsAppExport(androidSample), null, 2));
console.log("--- Year-first with system notices ---");
console.log(JSON.stringify(parseWhatsAppExport(yearFirstWithSystemNoticesSample), null, 2));
