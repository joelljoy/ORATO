// ── OpenRouter AI Client ───────────────────────────────────────
// Wraps the OpenRouter Chat Completions API with a simple, reusable helper.

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'google/gemini-2.5-flash';

// ── Types ──────────────────────────────────────────────────────

interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  max_tokens?: number;
}

interface OpenRouterChoice {
  message: {
    role: string;
    content: string;
  };
  finish_reason: string;
}

interface OpenRouterResponse {
  id: string;
  choices: OpenRouterChoice[];
  error?: {
    message: string;
    code?: number | string;
  };
}

// ── Helper ─────────────────────────────────────────────────────

/**
 * Sends a prompt to OpenRouter and returns the generated text.
 * Uses the default model (google/gemini-2.5-flash) unless overridden.
 */
export async function generateAIResponse(
  prompt: string,
  model: string = DEFAULT_MODEL
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set in environment variables.');
  }

  const max_tokens = 1500;
  console.log("[OpenRouter] Token limit:", max_tokens);

  const body: OpenRouterRequest = {
    model,
    messages: [{ role: 'user', content: prompt }],
    max_tokens,
  };

  let response: Response;
  try {
    response = await fetch(OPENROUTER_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });
  } catch (networkError) {
    console.error('[OpenRouter] Network error:', networkError);
    throw new Error(`OpenRouter network request failed: ${String(networkError)}`);
  }

  let data: OpenRouterResponse;
  try {
    data = (await response.json()) as OpenRouterResponse;
  } catch (parseError) {
    console.error('[OpenRouter] Failed to parse JSON response. HTTP status:', response.status);
    throw new Error(`OpenRouter returned non-JSON response (HTTP ${response.status})`);
  }

  if (!response.ok || data.error) {
    const errMsg = data.error?.message ?? `HTTP ${response.status}`;
    console.error('[OpenRouter] API error:', data.error ?? { status: response.status });
    throw new Error(`OpenRouter API error: ${errMsg}`);
  }

  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    console.error('[OpenRouter] Empty response body:', JSON.stringify(data));
    throw new Error('OpenRouter returned an empty response.');
  }

  return text;
}
