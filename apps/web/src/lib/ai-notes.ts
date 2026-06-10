/**
 * On-device NLP engine for PandiCRM AI Notes.
 * No external API calls — everything runs in the browser/server.
 */

export interface AiInsights {
  summary: string;
  actionItems: string[];
  entities: { type: string; value: string }[];
  tags: string[];
  sentiment: "positive" | "neutral" | "negative";
}

const ACTION_KEYWORDS = [
  "follow up", "follow-up", "followup",
  "schedule", "book", "set up", "setup",
  "call", "phone", "ring",
  "email", "mail", "send",
  "prepare", "draft", "create",
  "review", "look over", "go over",
  "send proposal", "send quote", "send contract",
  "meet", "meeting", "sync",
  "update", "change", "adjust",
  "remind", "ping", "nudge",
  "assign", "delegate",
  "check in", "touch base",
  "get back", "reach out",
  "confirm", "verify", "validate",
  "submit", "deliver", "share",
  "finish", "complete", "wrap up",
  "by monday", "by tuesday", "by wednesday", "by thursday", "by friday",
  "by next week", "by end of week", "by tomorrow", "by eod", "by cob",
  "asap", "urgent", "priority",
];

const POSITIVE_WORDS = [
  "great", "excellent", "amazing", "fantastic", "wonderful", "awesome",
  "love", "happy", "pleased", "thrilled", "excited", "optimistic",
  "positive", "good", "strong", "solid", "promising", "interested",
  "ready", "eager", "enthusiastic", "confident", "win", "won", "closed",
  "deal", "success", "progress", "milestone", "achievement",
];

const NEGATIVE_WORDS = [
  "bad", "terrible", "awful", "horrible", "disappointing", "frustrated",
  "angry", "upset", "concerned", "worried", "unhappy", "dissatisfied",
  "problem", "issue", "bug", "error", "fail", "failed", "lose", "lost",
  "delay", "delayed", "postpone", "cancel", "cancelled", "reject",
  "complaint", "unfortunately", "regret", "sorry",
];

const FILLER_WORDS = new Set([
  "um", "uh", "ah", "er", "hmm", "like", "you know", "i mean",
  "sort of", "kind of", "basically", "literally", "actually",
  "honestly", "so", "right", "okay", "ok", "well",
]);

/** Extract action items from raw text */
export function extractActionItems(text: string): string[] {
  const sentences = splitSentences(text);
  const items: string[] = [];

  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    const isAction = ACTION_KEYWORDS.some((kw) => lower.includes(kw));
    const hasAssignee = /\b(i|we|john|jane|team|alex|sarah|mike|chris|dan|lisa|tom|anna)\s+will\b/i.test(sentence) ||
                        /\b(assign|delegate|give)\s+to\b/i.test(sentence);
    const hasDeadline = /\b(by|before|until|due)\s+/i.test(sentence) ||
                        /\b(tomorrow|next week|monday|tuesday|wednesday|thursday|friday|eod|cob|asap)\b/i.test(sentence);

    if (isAction || hasAssignee || hasDeadline) {
      const cleaned = sentence.trim();
      if (cleaned.length > 10 && cleaned.length < 300) {
        items.push(cleaned);
      }
    }
  }

  // Deduplicate and limit
  return [...new Set(items)].slice(0, 10);
}

/** Extract entities: emails, phones, dates, dollar amounts, companies, people */
export function extractEntities(text: string): { type: string; value: string }[] {
  const entities: { type: string; value: string }[] = [];

  // Emails
  const emails = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
  if (emails) emails.forEach((e) => entities.push({ type: "email", value: e }));

  // Phone numbers (various formats)
  const phones = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g);
  if (phones) phones.forEach((p) => entities.push({ type: "phone", value: p }));

  // Dollar amounts
  const dollars = text.match(/\$[\d,]+(\.\d{2})?|\$\d+(k|K|m|M)?/g);
  if (dollars) dollars.forEach((d) => entities.push({ type: "amount", value: d }));

  // Dates
  const datePatterns = [
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(,\s+\d{4})?\b/gi,
    /\b\d{1,2}\/\d{1,2}(\/\d{2,4})?\b/g,
    /\b\d{4}-\d{2}-\d{2}\b/g,
    /\b(tomorrow|next week|next month|today|yesterday)\b/gi,
  ];
  for (const pattern of datePatterns) {
    const matches = text.match(pattern);
    if (matches) matches.forEach((m) => entities.push({ type: "date", value: m }));
  }

  // Company names (heuristic: capitalized words after "at", "from", "with", "@")
  const companyPattern = /\b(at|from|with|@)\s+([A-Z][a-zA-Z0-9\s&]+(?:Corp|Inc|Ltd|LLC|Company|Co\.?|Group|Partners|Solutions|Tech|Systems|Media|Digital|Studio|Labs)?)/g;
  let m: RegExpExecArray | null;
  while ((m = companyPattern.exec(text)) !== null) {
    const val = m[2].trim();
    if (val.length > 2 && val.length < 40) {
      entities.push({ type: "company", value: val });
    }
  }

  // People names (heuristic: "Mr/Ms/Dr + Name" or "Name + said/mentioned")
  const namePattern = /\b(Mr\.?|Ms\.?|Mrs\.?|Dr\.?)\s+([A-Z][a-z]+)\b/g;
  while ((m = namePattern.exec(text)) !== null) {
    entities.push({ type: "person", value: `${m[1]} ${m[2]}` });
  }

  return entities;
}

/** Generate extractive summary (top important sentences) */
export function generateSummary(text: string, maxSentences: number = 3): string {
  const sentences = splitSentences(text);
  if (sentences.length <= maxSentences) return text.trim();

  const scored = sentences.map((s) => ({
    text: s,
    score: scoreSentence(s, text),
  }));

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, maxSentences).map((s) => s.text);

  // Restore original order
  const summary = sentences.filter((s) => top.includes(s)).join(" ");
  return summary.trim();
}

/** Suggest tags based on content */
export function suggestTags(text: string): string[] {
  const lower = text.toLowerCase();
  const tags: string[] = [];

  const tagMap: Record<string, string[]> = {
    "follow-up": ["follow up", "follow-up", "followup"],
    "meeting": ["meeting", "sync", "standup", "call", "discussion"],
    "proposal": ["proposal", "quote", "pricing", "contract"],
    "urgent": ["urgent", "asap", "priority", "critical", "important"],
    "demo": ["demo", "presentation", "walkthrough", "showcase"],
    "onboarding": ["onboard", "setup", "training", "getting started"],
    "closing": ["close", "closing", "deal", "sign", "contract"],
    "support": ["support", "issue", "bug", "problem", "troubleshoot"],
    "feedback": ["feedback", "review", "input", "thoughts"],
    "pricing": ["price", "cost", "budget", "invoice", "payment", "$"],
  };

  for (const [tag, keywords] of Object.entries(tagMap)) {
    if (keywords.some((kw) => lower.includes(kw))) tags.push(tag);
  }

  return [...new Set(tags)].slice(0, 5);
}

/** Detect sentiment */
export function detectSentiment(text: string): "positive" | "neutral" | "negative" {
  const lower = text.toLowerCase();
  let pos = 0;
  let neg = 0;

  for (const w of POSITIVE_WORDS) {
    if (lower.includes(w)) pos++;
  }
  for (const w of NEGATIVE_WORDS) {
    if (lower.includes(w)) neg++;
  }

  if (pos > neg) return "positive";
  if (neg > pos) return "negative";
  return "neutral";
}

/** Main analysis function */
export function analyzeNote(text: string): AiInsights {
  return {
    summary: generateSummary(text),
    actionItems: extractActionItems(text),
    entities: extractEntities(text),
    tags: suggestTags(text),
    sentiment: detectSentiment(text),
  };
}

/** Cognizant text processor — cleans raw transcription into polished prose */
export function cognizantEdit(text: string): string {
  let result = text;

  // 1. Remove filler words and phrases
  const fillerPattern = new RegExp(
    "\\b(" + [...FILLER_WORDS].join("|") + ")\\b[,\\s]*",
    "gi"
  );
  result = result.replace(fillerPattern, " ");

  // 2. Fix repeated words (e.g., "the the", "and and")
  result = result.replace(/\b(\w+)\s+\1\b/gi, "$1");

  // 3. Fix common transcription artifacts
  result = result.replace(/\s+/g, " ");
  result = result.replace(/\s+([.,;:!?])/g, "$1");
  result = result.replace(/([.,;:!?])([^\s])/g, "$1 $2");

  // 4. Capitalize first letter of each sentence
  result = result.replace(/(^|[.!?]\s+)([a-z])/g, (_, sep, letter) => sep + letter.toUpperCase());

  // 5. Capitalize "I" when standalone
  result = result.replace(/\bi\b/g, "I");

  // 6. Fix common contractions spacing
  result = result.replace(/\b(don t|doesn t|didn t|can t|won t|isn t|aren t|wasn t|weren t|haven t|hasn t|hadn t|wouldn t|couldn t|shouldn t|let s|that s|it s|he s|she s|they re|we re|you re|i m|i ve|i ll)\b/gi, (m) => {
    const map: Record<string, string> = {
      "dont": "don't", "doesnt": "doesn't", "didnt": "didn't", "cant": "can't",
      "wont": "won't", "isnt": "isn't", "arent": "aren't", "wasnt": "wasn't",
      "werent": "weren't", "havent": "haven't", "hasnt": "hasn't", "hadnt": "hadn't",
      "wouldnt": "wouldn't", "couldnt": "couldn't", "shouldnt": "shouldn't",
      "lets": "let's", "thats": "that's", "its": "it's", "hes": "he's", "shes": "she's",
      "theyre": "they're", "were": "we're", "youre": "you're", "im": "I'm",
      "ive": "I've", "ill": "I'll",
    };
    return map[m.toLowerCase()] || m;
  });

  // 7. Group short sentences into paragraphs (every 3-5 sentences)
  const sentences = splitSentences(result);
  const paragraphs: string[] = [];
  let current: string[] = [];

  for (let i = 0; i < sentences.length; i++) {
    current.push(sentences[i]);
    // New paragraph on transition words or every 4 sentences
    const lower = sentences[i].toLowerCase();
    const isTransition = /\b(however|moreover|furthermore|additionally|consequently|therefore|meanwhile|alternatively|in summary|to conclude|on the other hand)\b/i.test(lower);
    if (isTransition || current.length >= 4) {
      paragraphs.push(current.join(" "));
      current = [];
    }
  }
  if (current.length > 0) paragraphs.push(current.join(" "));

  result = paragraphs.join("\n\n").trim();

  // 8. Final cleanup
  result = result.replace(/\n{3,}/g, "\n\n");
  result = result.replace(/\s+/g, " ");
  result = result.trim();

  return result;
}

/** Split text into sentences (handles abbreviations reasonably) */
function splitSentences(text: string): string[] {
  // Protect common abbreviations
  let protectedText = text;
  const abbreviations = ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof.", "Sr.", "Jr.", "Inc.", "Ltd.", "Corp.", "Co.", "vs.", "e.g.", "i.e.", "etc.", "a.m.", "p.m."];
  const placeholders: string[] = [];
  abbreviations.forEach((abbr) => {
    protectedText = protectedText.replace(new RegExp(abbr.replace(/\./g, "\\."), "g"), () => {
      placeholders.push(abbr);
      return `\x00${placeholders.length - 1}\x00`;
    });
  });

  const sentences = protectedText
    .replace(/([.!?])\s+/g, "$1\n")
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // Restore abbreviations
  return sentences.map((s) =>
    s.replace(/\x00(\d+)\x00/g, (_, i) => placeholders[parseInt(i, 10)])
  );
}

/** Score a sentence for importance (used in summary) */
function scoreSentence(sentence: string, fullText: string): number {
  let score = 0;
  const lower = sentence.toLowerCase();

  // Position bias: first and last sentences often important
  const sentences = splitSentences(fullText);
  const idx = sentences.indexOf(sentence);
  if (idx === 0 || idx === sentences.length - 1) score += 2;

  // Length: not too short, not too long
  const words = sentence.split(/\s+/).length;
  if (words >= 5 && words <= 25) score += 1;

  // Contains numbers/dates/amounts
  if (/\$\d|\\d{1,2}\/\\d{1,2}|January|February|March|April|May|June|July|August|September|October|November|December/.test(sentence)) score += 2;

  // Contains action keywords
  if (ACTION_KEYWORDS.some((kw) => lower.includes(kw))) score += 2;

  // Contains named entities
  if (/[A-Z][a-z]+\s+(Corp|Inc|Ltd|LLC|Company)/.test(sentence)) score += 1;
  if (/\b(Mr|Ms|Mrs|Dr)\b/.test(sentence)) score += 1;

  // Sentiment words indicate significance
  if (POSITIVE_WORDS.some((w) => lower.includes(w)) || NEGATIVE_WORDS.some((w) => lower.includes(w))) score += 1;

  return score;
}
