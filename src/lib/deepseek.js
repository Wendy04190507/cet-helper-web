// DeepSeek API client — uses Vite env var VITE_DEEPSEEK_API_KEY
// The API key is bundled into the frontend at build time.
// For production, proxy requests through your own backend instead.

const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || '';
const BASE_URL = 'https://api.deepseek.com';

/** Check if API key is configured */
export function isApiReady() {
  return !!API_KEY && !API_KEY.includes('your-key-here');
}

export async function deepseekChatJSON(messages, options = {}) {
  if (!isApiReady()) {
    throw new Error('请先配置 DeepSeek API Key：复制 .env.example 为 .env，填入你的 key。');
  }

  const { temperature = 0.7, maxTokens = 4096 } = options;

  const response = await fetch(`${BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`No JSON in response: ${content.slice(0, 200)}`);
  return JSON.parse(jsonMatch[0]);
}
