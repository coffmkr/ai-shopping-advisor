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

// Catálogo público (HU5)
router.get('/api/categories', [controllers.Catalog, 'categories'])
router.get('/api/categories/:slug/products', [controllers.Catalog, 'categoryProducts'])
router.get('/api/products/:slug', [controllers.Catalog, 'product'])

// Salida a Amazon con clic registrado
router.get('/go/:id', [controllers.Redirect, 'show'])
