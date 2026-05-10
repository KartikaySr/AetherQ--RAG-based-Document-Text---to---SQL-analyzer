export type RoutedIntent =
  | "general_chat"
  | "document_retrieval"
  | "analytics_sql"
  /** Run warehouse SQL snapshot + retrieval context + synthesized answer */
  | "analytics_and_documents";

const DOC_HINTS =
  /\b(policy|handbook|document|clause|contract|according to (the|your)|pdf|provision|termination|privacy|nda|human resources|employee manual|leave policy|benefits guide|procurement sop)\b/i;

const SQL_HINTS =
  /\b(revenue|quarter\b|sales\b|inventory|warehouse|sku|salary\b|employees?\b|headcount|departments?\b|avg\b|average|mean|median|sum\b|total\b|count\b|top \d|group by|trend|\bkpi\b|\bmetric\b|\bmargin\b|\bshipments?\b|freight\b|logistics|stock\b|reorder|sql\b|database\b|tabular|dataset|select\b)\b/i;

/**
 * When the UI is set to general mode, classify how to fulfil the utterance.
 * Explicit modes (documents/analytics) are handled upstream.
 */
export function classifyGeneralIntent(prompt: string): Omit<
  RoutedIntent,
  never
> {
  const trimmed = prompt.trim();
  if (!trimmed) return "general_chat";

  const doc = DOC_HINTS.test(trimmed);
  const sql = SQL_HINTS.test(trimmed);

  if (doc && sql) return "analytics_and_documents";
  if (sql) return "analytics_sql";
  if (doc) return "document_retrieval";
  return "general_chat";
}
