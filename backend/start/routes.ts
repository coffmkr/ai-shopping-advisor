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
import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'

router.get('/api/health', [controllers.Health, 'show'])

// Catálogo público (HU5)
router.get('/api/categories', [controllers.Catalog, 'categories'])
router.get('/api/categories/:slug/products', [controllers.Catalog, 'categoryProducts'])
router.get('/api/products/:slug', [controllers.Catalog, 'product'])

// Comparador (HU3)
router.get('/api/compare', [controllers.Catalog, 'compare'])

// Salida a Amazon con clic registrado
router.get('/go/:id', [controllers.Redirect, 'show'])

// Panel del administrador (HU4): todo /api/admin/* exige sesión salvo el login
router.post('/api/admin/session', [controllers.admin.Session, 'store'])
router
  .group(() => {
    router.get('session', [controllers.admin.Session, 'show'])
    router.delete('session', [controllers.admin.Session, 'destroy'])

    // Búsquedas del agente (HU1)
    router.get('agent-runs', [controllers.admin.AgentRuns, 'index'])
    router.post('agent-runs', [controllers.admin.AgentRuns, 'store'])
    router.get('agent-runs/:id', [controllers.admin.AgentRuns, 'show'])

    // Revisión y publicación de candidatos (HU2)
    router.get('candidates', [controllers.admin.Candidates, 'index'])
    router.get('candidates/:id', [controllers.admin.Candidates, 'show'])
    router.patch('candidates/:id', [controllers.admin.Candidates, 'update'])
  })
  .prefix('/api/admin')
  .use(middleware.auth())
