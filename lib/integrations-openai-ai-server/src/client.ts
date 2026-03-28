import OpenAI from "openai";

const apiKey =
  process.env.AI_INTEGRATIONS_OPENAI_API_KEY ?? process.env.OPENAI_API_KEY;

const baseURL =
  process.env.AI_INTEGRATIONS_OPENAI_BASE_URL ??
  (process.env.OPENAI_API_KEY ? "https://api.openai.com/v1" : undefined);

if (!apiKey || !baseURL) {
  throw new Error(
    "OpenAI configuration missing. " +
      "On Replit: provision the OpenAI AI integration (sets AI_INTEGRATIONS_OPENAI_BASE_URL + AI_INTEGRATIONS_OPENAI_API_KEY). " +
      "On Railway or other hosts: set OPENAI_API_KEY to your OpenAI API key.",
  );
}

export const openai = new OpenAI({ apiKey, baseURL });
