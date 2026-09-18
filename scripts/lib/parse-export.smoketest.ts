import { parseWhatsAppExport } from "./parse-export.js";

const iosSample = `[15/01/2024, 09:15:32] Sarah: Had coffee with Mum this morning. She was really happy but kept asking where Peter was.
[15/01/2024, 09:16:01] Sarah: <attached: 00000012-PHOTO-2024-01-15-09-16-00.jpg>
[15/01/2024, 18:02:10] Pete: Taking her to Dr. Patel on Tuesday, she's been forgetting her pills again.
This is a follow up on the confusion from last week.
[16/01/2024, 08:00:00] Sarah: ‎image omitted`;

const androidSample = `15/01/2024, 9:15 am - Sarah: Had coffee with Mum this morning.
15/01/2024, 9:16 am - Sarah: IMG-20240115-WA0001.jpg (file attached)`;

console.log("--- iOS ---");
console.log(JSON.stringify(parseWhatsAppExport(iosSample), null, 2));
console.log("--- Android ---");
console.log(JSON.stringify(parseWhatsAppExport(androidSample), null, 2));
