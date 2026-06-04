const DEEPSEEK_API_KEY = 'sk-7be0abbaa3ad41a3a3440fddb54933fb';
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';

export async function deepseekChatJSON(messages, options = {}) {
  const { temperature = 0.7, maxTokens = 4096 } = options;

  const response = await fetch(`${DEEPSEEK_BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
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
