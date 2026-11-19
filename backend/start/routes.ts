/*
|--------------------------------------------------------------------------
| Rutas HTTP
|--------------------------------------------------------------------------
|
| El navegador nunca llama a este servidor directamente: Nuxt reenvía /api/**
| y /go/** hacia aquí (un solo origen para la cookie de sesión).
|
*/

import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router.get('/api/health', [controllers.Health, 'show'])
