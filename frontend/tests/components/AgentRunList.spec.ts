import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AgentRunList from '~/components/AgentRunList.vue'
import type { AgentRun } from '~/types/admin'

function run(overrides: Partial<AgentRun>): AgentRun {
  return {
    id: 'r1',
    categoryId: 'c1',
    category: { slug: 'soportes-laptop', name: 'Soportes para laptop' },
    maxPriceUsd: 40,
    status: 'completed',
    isSeed: false,
    candidatesCreated: 3,
    providerRequests: 4,
    errorMessage: null,
    createdAt: '2026-11-18T12:00:00.000Z',
    startedAt: null,
    finishedAt: null,
    ...overrides,
  }
}

describe('AgentRunList', () => {
  it('muestra el estado de cada búsqueda en texto', async () => {
    const wrapper = await mountSuspended(AgentRunList, {
      props: {
        runs: [
          run({ id: 'a', status: 'queued' }),
          run({ id: 'b', status: 'running' }),
          run({ id: 'c', status: 'completed' }),
          run({ id: 'd', status: 'failed', errorMessage: 'El proveedor de datos no respondió' }),
        ],
      },
    })

    const text = wrapper.text()
    for (const label of ['En cola', 'Buscando', 'Completada', 'Fallida']) expect(text).toContain(label)
    expect(text).toContain('El proveedor de datos no respondió')
  })

  it('una búsqueda completada enlaza a sus candidatos en la cola de revisión', async () => {
    const wrapper = await mountSuspended(AgentRunList, { props: { runs: [run({ id: 'r42' })] } })

    const link = wrapper.find('a[href^="/admin/revision"]')
    expect(link.attributes('href')).toBe('/admin/revision?agentRunId=r42')
    expect(link.text()).toContain('3 candidatos')
  })
})
