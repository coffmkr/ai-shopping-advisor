import { AdminUserSchema } from '#database/schema'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'

/**
 * Administrador del sitio. La contraseña se guarda con hash (argon2/scrypt
 * según config/hash.ts) y nunca se serializa.
 */
export default class AdminUser extends compose(AdminUserSchema, withAuthFinder(hash)) {
  static table = 'admin_users'
}
