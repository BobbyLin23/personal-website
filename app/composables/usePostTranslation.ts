interface TranslatedPayload {
  title: string
  description: string
  date: string
  path: string
  body: any
  translated: boolean
  locale: string
  sourceLocale: string
}

export type TranslationState = 'idle' | 'connecting' | 'streaming' | 'done' | 'cached' | 'error'

export interface UsePostTranslationOptions {
  collection: 'blog' | 'weekly'
  /** Reactive base path, e.g. /blog/foo (no locale prefix) */
  path: () => string
  /** Reactive target locale; pass '' to disable */
  locale: () => string
  /** Whether to start streaming (e.g. only when not viewing original) */
  enabled: () => boolean
}

export function usePostTranslation(options: UsePostTranslationOptions) {
  const data = ref<TranslatedPayload | null>(null)
  const state = ref<TranslationState>('idle')
  const error = ref<string | null>(null)

  let source: EventSource | null = null
  let currentKey = ''
  let stopWatcher: (() => void) | null = null

  const close = () => {
    if (source) {
      source.close()
      source = null
    }
  }

  const start = () => {
    if (!import.meta.client)
      return

    const path = options.path()
    const locale = options.locale()
    const enabled = options.enabled()

    if (!enabled || !path || !locale) {
      close()
      state.value = 'idle'
      return
    }

    const key = `${locale}::${path}`
    if (key === currentKey && (state.value === 'streaming' || state.value === 'cached' || state.value === 'done'))
      return

    close()
    currentKey = key
    error.value = null
    state.value = 'connecting'

    const url = `/api/translate-stream?path=${encodeURIComponent(path)}&locale=${encodeURIComponent(locale)}&collection=${encodeURIComponent(options.collection)}`
    const es = new EventSource(url)
    source = es

    es.addEventListener('cached', (ev) => {
      try {
        const payload = JSON.parse((ev as MessageEvent).data) as TranslatedPayload
        data.value = payload
        state.value = 'cached'
      }
      catch {}
    })

    es.addEventListener('meta', (ev) => {
      try {
        const meta = JSON.parse((ev as MessageEvent).data) as { title: string, description: string, date: string }
        data.value = {
          ...(data.value ?? {} as TranslatedPayload),
          title: meta.title,
          description: meta.description,
          date: meta.date,
          path: options.path(),
          body: data.value?.body ?? null,
          translated: true,
          locale: options.locale(),
          sourceLocale: 'en',
        }
        state.value = 'streaming'
      }
      catch {}
    })

    es.addEventListener('chunk', (ev) => {
      try {
        const chunk = JSON.parse((ev as MessageEvent).data) as { body: any }
        data.value = {
          ...(data.value ?? {} as TranslatedPayload),
          body: chunk.body,
          translated: true,
          locale: options.locale(),
          sourceLocale: 'en',
          path: options.path(),
        }
        state.value = 'streaming'
      }
      catch {}
    })

    es.addEventListener('done', (ev) => {
      try {
        const payload = JSON.parse((ev as MessageEvent).data) as TranslatedPayload
        data.value = payload
        state.value = 'done'
      }
      catch {}
      close()
    })

    es.addEventListener('error', (ev) => {
      const messageEvt = ev as MessageEvent
      try {
        if (typeof messageEvt.data === 'string' && messageEvt.data.length) {
          const parsed = JSON.parse(messageEvt.data) as { message?: string }
          error.value = parsed.message || 'Translation failed'
        }
      }
      catch {}
      if (!error.value)
        error.value = 'Translation connection error'
      state.value = 'error'
      close()
    })
  }

  if (import.meta.client) {
    onMounted(() => {
      stopWatcher = watch(
        [options.path, options.locale, options.enabled],
        () => start(),
        { immediate: true },
      )
    })
  }

  onScopeDispose(() => {
    stopWatcher?.()
    close()
  })

  return {
    data,
    state,
    error,
    restart: start,
    close,
  }
}
