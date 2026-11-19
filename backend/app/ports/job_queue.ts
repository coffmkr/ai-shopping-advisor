/**
 * Puerto: cola de trabajos en segundo plano (hoy pg-boss sobre PostgreSQL).
 * Clase abstracta para usarla como clave del contenedor de AdonisJS.
 */
export abstract class JobQueue {
  abstract enqueueAgentRun(agentRunId: string): Promise<void>
}
