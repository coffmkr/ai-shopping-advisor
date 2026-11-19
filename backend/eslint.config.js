import { configApp } from '@adonisjs/eslint-config'

// database/schema.ts lo genera Lucid al migrar: no se formatea a mano.
export default configApp({ ignores: ['database/schema.ts'] })
