/**
 * Server-only validation for Text-to-SQL: read-only Postgres against allowlisted tables.
 */

export const ANALYTICS_TABLES = [
  "employees",
  "departments",
  "sales",
  "logistics",
  "inventory",
] as const;

const FORBIDDEN_TOKENS = [
  /\bDELETE\b/i,
  /\bDROP\b/i,
  /\bINSERT\b/i,
  /\bUPDATE\b/i,
  /\bALTER\b/i,
  /\bTRUNCATE\b/i,
  /\bCREATE\b/i,
  /\bGRANT\b/i,
  /\bREVOKE\b/i,
  /\bEXECUTE\b/i,
  /\bCALL\b/i,
  /\bCOPY\b/i,
  /\bINTO\s+OUTFILE\b/i,
  /\bPG_SLEEP\b/i,
  /\bSET\s+SESSION\b/i,
  /\bSET\s+ROLE\b/i,
  /\bVACUUM\b/i,
  /\bANALYZE\b/i,
  /\b\\copy\b/i,
  /\bUNION\b/i,
  /\bUNION\s+ALL\b/i,
  /\bINFORMATION_SCHEMA\b/i,
  /\bPG_CATALOG\b/i,
  /\bFOR\s+UPDATE\b/i,
  /\bFOR\s+SHARE\b/i,
];

const TABLE_REF_RE = /\b(?:FROM|JOIN)\s+([a-z_][a-z0-9_]*)/gi;

const MAX_SQL_LENGTH = 8000;
const DEFAULT_LIMIT = 500;
const MAX_LIMIT = 1000;

export type SqlValidationResult =
  | { ok: true; sql: string }
  | { ok: false; reason: string };

function stripSqlComments(input: string): string {
  let s = input.replace(/\/\*[\s\S]*?\*\//g, " ");
  s = s.replace(/--.*$/gm, " ");
  return s;
}

function ensureSelectOnly(normalized: string): boolean {
  const trimmed = normalized.trim();
  return /^\s*(WITH|SELECT)\b/i.test(trimmed);
}

function tablesReferenced(sql: string): string[] {
  const set = new Set<string>();
  let m: RegExpExecArray | null;
  const re = new RegExp(TABLE_REF_RE);
  while ((m = re.exec(sql)) !== null) {
    set.add(m[1].toLowerCase());
  }
  return [...set];
}

function onlyAllowlistedTables(sql: string): boolean {
  const refs = tablesReferenced(sql);
  const allow = new Set(ANALYTICS_TABLES);
  return refs.every((t) => allow.has(t as (typeof ANALYTICS_TABLES)[number]));
}

function noForbiddenPatterns(sql: string): boolean {
  for (const re of FORBIDDEN_TOKENS) {
    if (re.test(sql)) return false;
  }
  return true;
}

function semicolonSafe(sql: string): boolean {
  const withoutTrailing = sql.replace(/;+\s*$/g, "").trim();
  return !withoutTrailing.includes(";");
}

function enforceLimitClause(sql: string): string {
  const base = sql.replace(/;+\s*$/g, "").trim();
  if (/\blimit\s+\d+/i.test(base)) {
    return base.replace(/\blimit\s+(\d+)/i, (_a, n) => {
      const v = Math.min(parseInt(String(n), 10) || DEFAULT_LIMIT, MAX_LIMIT);
      return `LIMIT ${v}`;
    });
  }
  return `${base} LIMIT ${DEFAULT_LIMIT}`;
}

export function extractSqlFromModelOutput(raw: string): string | null {
  const fence = raw.match(/```(?:sql)?\s*([\s\S]*?)```/i);
  if (fence?.[1]) return fence[1].trim();
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const start = lines.findIndex((l) => /^(WITH|SELECT)\b/i.test(l));
  if (start === -1) return null;
  return lines.slice(start).join(" ").trim();
}

export function validateAndNormalizeAnalyticsSql(candidate: string): SqlValidationResult {
  if (!candidate || typeof candidate !== "string") {
    return { ok: false, reason: "Empty SQL." };
  }
  if (candidate.length > MAX_SQL_LENGTH) {
    return { ok: false, reason: "SQL exceeds maximum length." };
  }

  const withoutComments = stripSqlComments(candidate).replace(/\s+/g, " ").trim();

  if (!semicolonSafe(withoutComments)) {
    return { ok: false, reason: "Multiple statements or unsafe semicolon usage." };
  }

  if (!ensureSelectOnly(withoutComments)) {
    return { ok: false, reason: "Only SELECT (optionally WITH … SELECT) queries are allowed." };
  }

  if (!noForbiddenPatterns(withoutComments)) {
    return { ok: false, reason: "Disallowed SQL keyword or pattern detected." };
  }

  if (!onlyAllowlistedTables(withoutComments)) {
    return {
      ok: false,
      reason: `Query may only reference: ${ANALYTICS_TABLES.join(", ")}.`,
    };
  }

  const safe = enforceLimitClause(withoutComments);
  return { ok: true, sql: safe };
}
