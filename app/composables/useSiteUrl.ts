export function useSiteUrl() {
  const config = useRuntimeConfig()
  const requestUrl = useRequestURL()

  return computed(() => {
    const configured = config.public.siteUrl?.replace(/\/$/, '')
    if (configured) return configured
    if (import.meta.client) return `${window.location.protocol}//${window.location.host}`
    return `${requestUrl.protocol}//${requestUrl.host}`
  })
}
