const parseCommaList = (value: string | undefined) =>
  (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

/**
 * Site owner emails come from `NUXT_SITE_OWNER_EMAILS` (comma-separated).
 * When unset, the configured GitHub owner account is treated as the owner.
 * The owner is the only account allowed to publish moments.
 */
export function getSiteOwnerEmails() {
  const runtimeConfig = useRuntimeConfig()
  const explicit = runtimeConfig.siteOwnerEmails as string | undefined

  if (explicit) {
    return parseCommaList(explicit)
  }

  const githubOwner = runtimeConfig.github?.owner as string | undefined
  return githubOwner ? [`${githubOwner}@users.noreply.github.com`] : []
}

export function isSiteOwner(email: string | null | undefined) {
  if (!email) return false
  return getSiteOwnerEmails().some((owner) => owner.toLowerCase() === email.toLowerCase())
}
