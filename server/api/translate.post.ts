const SYSTEM_PROMPT = 'Translate the HTML content from Russian to Uzbek. Preserve all HTML tags exactly as they are. Only translate the text content inside the tags. Return only the translated HTML, no explanations.'

// ~40k chars per chunk to stay well under 200k TPM
const CHUNK_SIZE = 40_000

function splitIntoChunks(html: string): string[] {
  if (html.length <= CHUNK_SIZE) return [html]

  const chunks: string[] = []
  // Split on block-level tag boundaries to avoid cutting mid-tag
  const blockBoundary = /(?=<(?:p|h[1-6]|ul|ol|li|blockquote|pre|div|table|tr|thead|tbody|section|article)[>\s])/i
  const parts = html.split(blockBoundary)

  let current = ''
  for (const part of parts) {
    if (current.length + part.length > CHUNK_SIZE && current.length > 0) {
      chunks.push(current)
      current = part
    } else {
      current += part
    }
  }
  if (current) chunks.push(current)

  return chunks
}

async function translateChunk(chunk: string, apiKey: string): Promise<string> {
  const response = await $fetch<{ choices: { message: { content: string } }[] }>(
    'https://api.openai.com/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: chunk }
        ],
        temperature: 0.3
      }
    }
  )
  const content = response.choices[0]?.message.content
  if (!content) throw new Error('OpenAI javob qaytarmadi')
  return content
}

export default defineEventHandler(async (event) => {
  const { html } = await readBody<{ html: string }>(event)
  const config = useRuntimeConfig()

  if (!config.openaiApiKey) {
    throw createError({ statusCode: 500, statusMessage: 'OpenAI API key not configured' })
  }

  try {
    const chunks = splitIntoChunks(html)
    const translated: string[] = []

    for (const chunk of chunks) {
      const result = await translateChunk(chunk, config.openaiApiKey)
      translated.push(result)
      // Small delay between chunks to avoid TPM spikes
      if (chunks.length > 1) await new Promise(r => setTimeout(r, 500))
    }

    return { html: translated.join('') }
  } catch (err: unknown) {
    const e = err as {
      statusCode?: number
      statusMessage?: string
      data?: { error?: { message?: string } }
    }
    throw createError({
      statusCode: e?.statusCode ?? 502,
      statusMessage: e?.data?.error?.message ?? e?.statusMessage ?? 'OpenAI request failed'
    })
  }
})
