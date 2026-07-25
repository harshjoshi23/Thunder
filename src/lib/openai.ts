import { ChatOpenAI } from "@langchain/openai";

export function hasOpenAIKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function shouldForceMock(): boolean {
  return process.env.FORCE_MOCK === "true" || process.env.FORCE_MOCK === "1";
}

export function createChatModel(temperature = 0.3): ChatOpenAI {
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o";
  return new ChatOpenAI({
    model,
    temperature,
    apiKey: process.env.OPENAI_API_KEY,
  });
}
