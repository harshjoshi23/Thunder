/**
 * CSV / comment import helpers — no DB, safe for Vitest.
 */

export type ParsedCommentRow = {
  text: string;
  author?: string;
};

export type CsvParseResult = {
  comments: ParsedCommentRow[];
  /** Normalized multiline text suitable for /api/analyze commentsText */
  commentsText: string;
  skippedEmpty: number;
};

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  cells.push(current.trim());
  return cells;
}

function detectTextColumn(headers: string[]): number {
  const lower = headers.map((h) => h.toLowerCase().replace(/\s+/g, ""));
  const preferred = [
    "comment",
    "comments",
    "text",
    "body",
    "content",
    "message",
  ];
  for (const key of preferred) {
    const idx = lower.indexOf(key);
    if (idx >= 0) return idx;
  }
  return 0;
}

function detectAuthorColumn(headers: string[]): number | null {
  const lower = headers.map((h) => h.toLowerCase().replace(/\s+/g, ""));
  for (const key of ["author", "username", "user", "name", "handle"]) {
    const idx = lower.indexOf(key);
    if (idx >= 0) return idx;
  }
  return null;
}

/**
 * Parse comment CSV or plain newline-separated paste.
 * Accepts headered CSV (`comment,author`) or raw lines.
 */
export function parseCommentsCsv(raw: string): CsvParseResult {
  const text = raw.replace(/^\uFEFF/, "").trim();
  if (!text) {
    return { comments: [], commentsText: "", skippedEmpty: 0 };
  }

  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) {
    return { comments: [], commentsText: "", skippedEmpty: 0 };
  }

  const firstCells = splitCsvLine(lines[0]!);
  const looksLikeHeader =
    firstCells.length > 1 ||
    /^(comment|comments|text|body|content|message)$/i.test(
      firstCells[0]?.replace(/\s+/g, "") ?? "",
    );

  let start = 0;
  let textCol = 0;
  let authorCol: number | null = null;

  if (looksLikeHeader && firstCells.length >= 1) {
    textCol = detectTextColumn(firstCells);
    authorCol = detectAuthorColumn(firstCells);
    start = 1;
  }

  const comments: ParsedCommentRow[] = [];
  let skippedEmpty = 0;

  for (let i = start; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i]!);
    const commentText = (cells[textCol] ?? cells[0] ?? "").trim();
    if (!commentText) {
      skippedEmpty++;
      continue;
    }
    const author =
      authorCol != null ? (cells[authorCol] ?? "").trim() || undefined : undefined;
    comments.push({ text: commentText, author });
  }

  // Plain paste fallback: if header detection ate everything, treat as lines
  if (comments.length === 0 && looksLikeHeader && lines.length === 1) {
    const only = lines[0]!.trim();
    if (only) comments.push({ text: only });
  }

  const commentsText = comments.map((c) => c.text).join("\n");
  return { comments, commentsText, skippedEmpty };
}

export function countCommentLines(commentsText: string): number {
  return commentsText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean).length;
}
