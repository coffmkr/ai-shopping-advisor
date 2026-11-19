/**
 * Protege las páginas del panel: sin sesión de administrador, al login.
 * Es una comodidad de navegación; la protección real está en el servidor
 * (todo /api/admin/* responde 401 sin sesión).
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const requestFetch = useRequestFetch()
  const admin = useState<{ id: string; email: string } | null>('admin', () => null)

  try {
    admin.value = await requestFetch('/api/admin/session')
  } catch {
    admin.value = null
  }

  const isLogin = to.path === '/admin/login'
  if (!admin.value && !isLogin) return navigateTo('/admin/login')
  if (admin.value && isLogin) return navigateTo('/admin')
})
