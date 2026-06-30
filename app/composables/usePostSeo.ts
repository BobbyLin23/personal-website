interface UsePostSeoOptions {
  title: MaybeRefOrGetter<string | undefined>
  description: MaybeRefOrGetter<string | undefined>
  image?: MaybeRefOrGetter<string | undefined>
  type?: 'article' | 'website'
}

function resolveAbsoluteUrl(base: string, path: string) {
  if (!path) return undefined
  if (/^https?:\/\//i.test(path)) return path
  const normalizedBase = base.replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${normalizedBase}${normalizedPath}`
}

export function usePostSeo(options: UsePostSeoOptions) {
  const route = useRoute()
  const { t } = useI18n()
  const siteUrl = useSiteUrl()

  const pageUrl = computed(() => `${siteUrl.value}${route.path}`)

  const ogImage = computed(() => {
    const customImage = toValue(options.image)
    if (customImage) return resolveAbsoluteUrl(siteUrl.value, customImage)
    return resolveAbsoluteUrl(siteUrl.value, '/og/default.png')
  })

  useSeoMeta({
    title: () => toValue(options.title),
    description: () => toValue(options.description),
    ogTitle: () => toValue(options.title),
    ogDescription: () => toValue(options.description),
    ogType: options.type ?? 'article',
    ogUrl: () => pageUrl.value,
    ogSiteName: () => t('site.name'),
    ogImage: () => ogImage.value,
    ogImageAlt: () => toValue(options.title),
    twitterCard: 'summary_large_image',
    twitterTitle: () => toValue(options.title),
    twitterDescription: () => toValue(options.description),
    twitterImage: () => ogImage.value,
  })

  useHead({
    link: () => [{ rel: 'canonical', href: pageUrl.value }],
  })

  return { pageUrl, ogImage }
}
