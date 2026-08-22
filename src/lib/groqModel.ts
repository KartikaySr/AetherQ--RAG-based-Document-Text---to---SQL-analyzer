/** Groq chat/completions model (env override for upgrades or rate limits). */
export const GROQ_CHAT_MODEL =
  process.env.GROQ_CHAT_MODEL?.trim() || "openai/gpt-oss-20b";
