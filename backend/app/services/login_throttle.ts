/**
 * Límite de intentos fallidos de inicio de sesión por email (en memoria, sin IPs).
 * Tras MAX_FAILURES fallos dentro de WINDOW_MS se bloquean nuevos intentos hasta
 * que la ventana caduca. Se reinicia con el proceso: suficiente para una demo
 * con un único administrador (ver design.md del change t3-acceso-admin).
 */
export const MAX_FAILURES = 5
export const WINDOW_MS = 60_000

const failures = new Map<string, number[]>()

function key(email: string) {
  return email.trim().toLowerCase()
}

function recent(email: string, now: number) {
  const timestamps = (failures.get(key(email)) ?? []).filter((t) => now - t < WINDOW_MS)
  failures.set(key(email), timestamps)
  return timestamps
}

export const loginThrottle = {
  isBlocked(email: string, now = Date.now()) {
    return recent(email, now).length >= MAX_FAILURES
  },

  registerFailure(email: string, now = Date.now()) {
    recent(email, now).push(now)
  },

  reset(email: string) {
    failures.delete(key(email))
  },
}
