import { Anthropic } from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function jsonCall({system, prompt, model="claude-3-5-sonnet-20240620"}:{
  system: string; prompt: string; model?: string;
}) {
  const resp = await anthropic.messages.create(
    {
      model,
      max_tokens: 4000,
      temperature: 0.1,
      system,
      messages: [{ role: "user", content: prompt }],
    },
    { headers: { "anthropic-beta": "prompt-caching-2024-07-31" } }
  );
  return resp;
}
