import Groq from "groq-sdk";

export function getGroqClient(customKey?: string | null): Groq {
  const apiKey = customKey || process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY is not configured. Please supply GROQ_API_KEY in .env.local or provide an API key in the detective console."
    );
  }
  return new Groq({ apiKey });
}

// Model configurations as specified in the requirements
export const GROQ_MODELS = {
  // Suspect chat & final verdict grading & case generation
  PRIMARY: "openai/gpt-oss-120b",
  // Forensic clue analysis
  FORENSICS: "openai/gpt-oss-20b",
} as const;
