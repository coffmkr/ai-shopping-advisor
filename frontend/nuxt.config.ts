import tailwindcss from '@tailwindcss/vite'

/**
 * Dirección interna del backend AdonisJS. El navegador nunca la ve: Nuxt es el
 * único origen y reenvía /api/** y /go/** hacia ella (cookie de sesión
 * SameSite=Strict sin CORS).
 */
const apiInternalUrl = process.env.API_INTERNAL_URL ?? 'http://localhost:3333'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  routeRules: {
    '/api/**': { proxy: `${apiInternalUrl}/api/**` },
    '/go/**': { proxy: `${apiInternalUrl}/go/**` },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'es' },
      title: 'AI Shopping Advisor',
      meta: [
        {
          name: 'description',
          content: 'Productos recomendados para tu escritorio y home office, con el porqué de cada recomendación.',
        },
      ],
    },
  },
})
