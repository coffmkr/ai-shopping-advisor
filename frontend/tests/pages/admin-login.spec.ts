import { describe, expect, it } from 'vitest'
import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import { defineEventHandler, setResponseStatus } from 'h3'
import LoginPage from '~/pages/admin/login.vue'

describe('Pantalla de login del administrador', () => {
  it('muestra el mensaje de error ante credenciales incorrectas', async () => {
    registerEndpoint('/api/admin/session', {
      method: 'POST',
      handler: defineEventHandler((event) => {
        // Mismo cuerpo que responde el backend ante credenciales inválidas
        setResponseStatus(event, 400)
        return { error: 'invalid_credentials', message: 'Email o contraseña incorrectos' }
      }),
    })

    const wrapper = await mountSuspended(LoginPage, { route: '/admin/login' })
    await wrapper.find('input[type="email"]').setValue('admin@ai-shopping-advisor.test')
    await wrapper.find('input[type="password"]').setValue('clave-equivocada')
    await wrapper.find('form').trigger('submit')
    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(wrapper.find('[role="alert"]').text()).toContain('Email o contraseña incorrectos')
  })
})
