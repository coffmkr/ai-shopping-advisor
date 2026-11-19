import type { HttpContext } from '@adonisjs/core/http'
import AdminUser from '#models/admin_user'
import { loginValidator } from '#validators/session'
import { loginThrottle } from '#services/login_throttle'

const INVALID_CREDENTIALS = 'Email o contraseña incorrectos'

export default class SessionController {
  /** POST /api/admin/session */
  async store({ request, response, auth }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    if (loginThrottle.isBlocked(email)) {
      return response.tooManyRequests({
        error: 'too_many_attempts',
        message: 'Demasiados intentos. Espera un minuto antes de volver a intentarlo.',
      })
    }

    let admin: AdminUser
    try {
      admin = await AdminUser.verifyCredentials(email, password)
    } catch {
      loginThrottle.registerFailure(email)
      return response.badRequest({ error: 'invalid_credentials', message: INVALID_CREDENTIALS })
    }

    loginThrottle.reset(email)
    await auth.use('web').login(admin)
    return { id: admin.id, email: admin.email }
  }

  /** GET /api/admin/session */
  async show({ auth }: HttpContext) {
    const admin = auth.getUserOrFail()
    return { id: admin.id, email: admin.email }
  }

  /** DELETE /api/admin/session */
  async destroy({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.noContent()
  }
}
