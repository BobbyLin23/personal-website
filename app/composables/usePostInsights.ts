export interface PostInsightData {
  summary: string
  keyPoints: string[]
  takeaways: string[]
  audience: string
  path: string
  locale: string
  cached: boolean
}

export interface UsePostInsightsOptions {
  path: () => string
  locale: () => string
  enabled?: () => boolean
}

export function usePostInsights(options: UsePostInsightsOptions) {
  const data = shallowRef<PostInsightData | null>(null)
  const pending = ref(false)
  const error = ref<string | null>(null)

  let currentKey = ''
  let controller: AbortController | null = null
  let stopWatcher: (() => void) | null = null

  const close = () => {
    controller?.abort()
    controller = null
  }

  const load = async () => {
    if (!import.meta.client)
      return

    const path = options.path()
    const locale = options.locale()
    const enabled = options.enabled?.() ?? true

    if (!enabled || !path || !locale) {
      close()
      pending.value = false
      return
    }

    const key = `${locale}::${path}`
    if (key === currentKey && (pending.value || data.value))
      return

    close()
    currentKey = key
    pending.value = true
    error.value = null
    controller = new AbortController()

    try {
      data.value = await $fetch<PostInsightData>('/api/ai-insights', {
        query: {
          path,
          locale,
          collection: 'blog',
        },
        signal: controller.signal,
      })
    }
    catch (err: any) {
      if (err?.name !== 'AbortError')
        error.value = err?.statusMessage || err?.message || 'AI insights unavailable'
    }
    finally {
      pending.value = false
    }
  }

  if (import.meta.client) {
    onMounted(() => {
      stopWatcher = watch(
        [options.path, options.locale, () => options.enabled?.() ?? true],
        () => load(),
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
    pending,
    error,
    refresh: load,
  }
}
