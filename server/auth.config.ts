import { defineServerAuth } from '@onmax/nuxt-better-auth/config'

interface OAuthClientConfig {
  clientId: string
  clientSecret: string
}

export default defineServerAuth(({ runtimeConfig, requestOrigin }) => {
  const siteUrl = String(runtimeConfig.public.siteUrl || '')
  const authGithub = runtimeConfig.authGithub as OAuthClientConfig
  const authGoogle = runtimeConfig.authGoogle as OAuthClientConfig
  const trustedOrigins = [siteUrl, requestOrigin, 'http://localhost:3000'].filter(
    (origin, index, list): origin is string => Boolean(origin) && list.indexOf(origin) === index,
  )

  return {
    appName: 'Bobby Lin',
    emailAndPassword: {
      enabled: false,
    },
    trustedOrigins,
    socialProviders: {
      github: {
        clientId: authGithub.clientId,
        clientSecret: authGithub.clientSecret,
      },
      google: {
        clientId: authGoogle.clientId,
        clientSecret: authGoogle.clientSecret,
      },
    },
  }
})
