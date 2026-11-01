/** Return actionable provider errors without exposing request bodies or credentials. */
export function publicAiError(error: unknown): string {
  const status = (error as { statusCode?: number } | null)?.statusCode;
  if (status === 401 || status === 403) return "The AI provider rejected this deployment's API key. The administrator must update GROQ_API_KEY in Vercel and redeploy.";
  if (status === 429) return "The AI provider is temporarily rate-limited. Please retry shortly.";
  if (status === 400 || status === 404) return "The configured AI model is unavailable. The administrator must check GROQ_CHAT_MODEL in Vercel.";
  return "The AI service could not produce an answer. Please retry.";
}
