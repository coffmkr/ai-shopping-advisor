import { test } from '@japa/runner'

test.group('Salud del sistema', () => {
  test('GET /api/health responde ok y confirma la conexión con la base de datos', async ({
    client,
  }) => {
    const response = await client.get('/api/health')

    response.assertStatus(200)
    response.assertBodyContains({ status: 'ok', database: 'ok' })
  })
})
