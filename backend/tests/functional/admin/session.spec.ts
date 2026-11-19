import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { randomUUID } from 'node:crypto'
import AdminUser from '#models/admin_user'

const PASSWORD = 'clave-de-prueba-123'

async function createAdmin() {
  return AdminUser.create({ email: `admin-${randomUUID()}@test.test`, password: PASSWORD })
}

test.group('Sesión del administrador', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('inicia sesión con credenciales correctas sin devolver la contraseña', async ({
    client,
    assert,
  }) => {
    const admin = await createAdmin()

    const response = await client
      .post('/api/admin/session')
      .json({ email: admin.email, password: PASSWORD })

    response.assertStatus(200)
    response.assertBody({ id: admin.id, email: admin.email })
    assert.notInclude(JSON.stringify(response.body()), 'password')
  })

  test('la cookie de sesión es HttpOnly y SameSite=Strict', async ({ client, assert }) => {
    const admin = await createAdmin()

    const response = await client
      .post('/api/admin/session')
      .json({ email: admin.email, password: PASSWORD })

    const cookies = [response.header('set-cookie')].flat().join('\n')
    assert.match(cookies, /HttpOnly/i)
    assert.match(cookies, /SameSite=Strict/i)
  })

  test('rechaza un formato inválido con 422', async ({ client }) => {
    const response = await client
      .post('/api/admin/session')
      .json({ email: 'no-es-un-email', password: '' })

    response.assertStatus(422)
  })

  test('responde igual ante contraseña incorrecta y email inexistente', async ({
    client,
    assert,
  }) => {
    const admin = await createAdmin()

    const wrongPassword = await client
      .post('/api/admin/session')
      .json({ email: admin.email, password: 'otra-clave-123' })
    const unknownEmail = await client
      .post('/api/admin/session')
      .json({ email: `nadie-${randomUUID()}@test.test`, password: PASSWORD })

    wrongPassword.assertStatus(400)
    unknownEmail.assertStatus(400)
    assert.deepEqual(wrongPassword.body(), unknownEmail.body())
    assert.equal(wrongPassword.body().message, 'Email o contraseña incorrectos')
  })

  test('bloquea el sexto intento fallido en un minuto aunque la clave sea correcta', async ({
    client,
  }) => {
    const admin = await createAdmin()
    for (let attempt = 0; attempt < 5; attempt++) {
      await client.post('/api/admin/session').json({ email: admin.email, password: 'mala-clave-1' })
    }

    const response = await client
      .post('/api/admin/session')
      .json({ email: admin.email, password: PASSWORD })

    response.assertStatus(429)
  })

  test('sin sesión la API del panel responde 401', async ({ client }) => {
    const response = await client.get('/api/admin/session')

    response.assertStatus(401)
  })

  test('el login guarda al administrador en la sesión', async ({ client, assert }) => {
    const admin = await createAdmin()

    const login = await client
      .post('/api/admin/session')
      .json({ email: admin.email, password: PASSWORD })

    assert.equal(login.session().auth_web, admin.id)
  })

  test('con sesión devuelve el administrador actual', async ({ client }) => {
    const admin = await createAdmin()

    const response = await client.get('/api/admin/session').loginAs(admin)

    response.assertStatus(200)
    response.assertBody({ id: admin.id, email: admin.email })
  })

  test('cerrar sesión quita al administrador de la sesión', async ({ client, assert }) => {
    const admin = await createAdmin()

    const logout = await client.delete('/api/admin/session').loginAs(admin)

    logout.assertStatus(204)
    assert.notProperty(logout.session(), 'auth_web')
  })
})
