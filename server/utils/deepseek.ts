const TRANSLATION_SYSTEM_PROMPT = `You are a professional translator specializing in technical Markdown content. Translate the user-provided text from English into Simplified Chinese (zh-CN).

Rules:
- Preserve all Markdown syntax exactly: headings, lists, tables, blockquotes, fenced code blocks, inline code, links, images, HTML, and MDC component syntax ( ::component-name , :::component , etc.).
- Do NOT translate: code inside fenced code blocks, inline code, URLs, file paths, CLI commands, environment variable names, or brand / product names (e.g. React, Vue, Nuxt, TypeScript, GitHub, Cursor, Claude, DeepSeek, OpenAI).
- Keep the same number of paragraphs, line breaks, and the same overall structure.
- Keep any front-matter separators ('---') intact if present.
- Output ONLY the translated Markdown with no explanations, no greetings, no surrounding code fences.
- Use natural, professional Simplified Chinese suitable for a software engineer's blog.`

interface DeepSeekChatResponse {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
}

export interface PostInsightPayload {
  summary: string
  keyPoints: string[]
  takeaways: string[]
  audience: string
}

export interface TranslateOptions {
  targetLocale: string
}

interface DeepSeekConfig {
  apiKey: string
  model: string
  baseUrl: string
}

function getDeepSeekConfig(): DeepSeekConfig {
  const config = useRuntimeConfig()
  const apiKey = config.deepseekApiKey as string
  const model = (config.deepseekModel as string) || 'deepseek-chat'
  const baseUrl = ((config.deepseekBaseUrl as string) || 'https://api.deepseek.com').replace(/\/$/, '')
  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'DeepSeek API key is not configured (NUXT_DEEPSEEK_API_KEY).',
    })
  }
  return { apiKey, model, baseUrl }
}

function buildSystemPrompt(targetLocale: string): string {
  return targetLocale === 'zh'
    ? TRANSLATION_SYSTEM_PROMPT
    : TRANSLATION_SYSTEM_PROMPT.replace('Simplified Chinese (zh-CN)', `locale "${targetLocale}"`)
}

function buildInsightSystemPrompt(targetLocale: string): string {
  const outputLanguage = targetLocale === 'zh' ? 'Simplified Chinese' : 'English'
  return `You analyze technical blog posts and produce concise reader-facing insights.

Rules:
- Output language: ${outputLanguage}.
- Return ONLY valid JSON with this exact shape:
  {
    "summary": "One concise paragraph, 45-80 words.",
    "keyPoints": ["3-5 concrete points from the post."],
    "takeaways": ["2-4 practical takeaways for a software engineer."],
    "audience": "One short sentence describing who should read this."
  }
- Do not wrap the JSON in Markdown or code fences.
- Do not invent facts that are not supported by the source post.
- Keep product names, code identifiers, URLs, and technical terms accurate.`
}

export async function translateMarkdown(
  text: string,
  options: TranslateOptions = { targetLocale: 'zh' },
): Promise<string> {
  if (!text.trim())
    return text

  const { apiKey, model, baseUrl } = getDeepSeekConfig()

  const res = await $fetch<DeepSeekChatResponse>(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: {
      model,
      temperature: 0.2,
      stream: false,
      messages: [
        { role: 'system', content: buildSystemPrompt(options.targetLocale) },
        { role: 'user', content: text },
      ],
    },
    timeout: 60_000,
    retry: 1,
    retryStatusCodes: [408, 409, 425, 429, 500, 502, 503, 504],
  })

  const content = res?.choices?.[0]?.message?.content
  if (!content) {
    throw createError({
      statusCode: 502,
      statusMessage: 'DeepSeek returned an empty translation.',
    })
  }

  return stripCodeFenceWrapper(content.trim())
}

export async function generatePostInsights(
  text: string,
  options: TranslateOptions = { targetLocale: 'en' },
): Promise<PostInsightPayload> {
  if (!text.trim()) {
    return {
      summary: '',
      keyPoints: [],
      takeaways: [],
      audience: '',
    }
  }

  const { apiKey, model, baseUrl } = getDeepSeekConfig()

  const res = await $fetch<DeepSeekChatResponse>(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: {
      model,
      temperature: 0.2,
      stream: false,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: buildInsightSystemPrompt(options.targetLocale) },
        { role: 'user', content: text },
      ],
    },
    timeout: 60_000,
    retry: 1,
    retryStatusCodes: [408, 409, 425, 429, 500, 502, 503, 504],
  })

  const content = res?.choices?.[0]?.message?.content
  if (!content) {
    throw createError({
      statusCode: 502,
      statusMessage: 'DeepSeek returned empty insights.',
    })
  }

  return normalizeInsights(JSON.parse(stripCodeFenceWrapper(content.trim())))
}

export interface StreamTranslateOptions extends TranslateOptions {
  signal?: AbortSignal
}

const SSE_LINE_RE = /^data:\s?(.*)$/

export async function streamTranslateMarkdown(
  text: string,
  options: StreamTranslateOptions,
  onDelta: (delta: string, accumulated: string) => void | Promise<void>,
): Promise<string> {
  if (!text.trim())
    return text

  const { apiKey, model, baseUrl } = getDeepSeekConfig()

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      stream: true,
      messages: [
        { role: 'system', content: buildSystemPrompt(options.targetLocale) },
        { role: 'user', content: text },
      ],
    }),
    signal: options.signal,
  })

  if (!response.ok || !response.body) {
    const detail = await response.text().catch(() => '')
    throw createError({
      statusCode: 502,
      statusMessage: `DeepSeek stream failed (${response.status}): ${detail.slice(0, 200)}`,
    })
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let accumulated = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done)
        break
      buffer += decoder.decode(value, { stream: true })

      let newlineIdx = buffer.indexOf('\n')
      while (newlineIdx !== -1) {
        const line = buffer.slice(0, newlineIdx).trim()
        buffer = buffer.slice(newlineIdx + 1)
        newlineIdx = buffer.indexOf('\n')

        if (!line)
          continue
        const m = line.match(SSE_LINE_RE)
        if (!m)
          continue
        const data = m[1]!.trim()
        if (data === '[DONE]')
          continue

        try {
          const json = JSON.parse(data) as { choices?: Array<{ delta?: { content?: string } }> }
          const delta = json.choices?.[0]?.delta?.content
          if (delta) {
            accumulated += delta
            await onDelta(delta, accumulated)
          }
        }
        catch {
          // ignore malformed line
        }
      }
    }
  }
  finally {
    try {
      await reader.cancel()
    }
    catch {}
  }

  return stripCodeFenceWrapper(accumulated.trim())
}

function stripCodeFenceWrapper(text: string): string {
  const fence = /^```(?:markdown|md)?[ \t]*\r?\n([\s\S]*?)\r?\n```$/i
  const match = text.match(fence)
  return match ? match[1]! : text
}

function normalizeInsights(value: unknown): PostInsightPayload {
  const input = value as Partial<PostInsightPayload>
  return {
    summary: typeof input.summary === 'string' ? input.summary.trim() : '',
    keyPoints: normalizeStringList(input.keyPoints, 5),
    takeaways: normalizeStringList(input.takeaways, 4),
    audience: typeof input.audience === 'string' ? input.audience.trim() : '',
  }
}

function normalizeStringList(value: unknown, limit: number): string[] {
  if (!Array.isArray(value))
    return []
  return value
    .filter((item): item is string => typeof item === 'string')
    .map(item => item.trim())
    .filter(Boolean)
    .slice(0, limit)
}
