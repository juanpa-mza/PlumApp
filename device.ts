/**
 * Genera o recupera un device ID único del localStorage.
 * Sirve para limitar 1 voto por dispositivo.
 */
export function getDeviceId(): string {
  if (typeof window === 'undefined') return ''
  
  let id = localStorage.getItem('plum_device_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('plum_device_id', id)
  }
  return id
}

/**
 * Guarda el voto emitido en localStorage para prevenir doble voto.
 */
export function saveVoteLocally(eventoId: string, elenco: string) {
  localStorage.setItem(`plum_vote_${eventoId}`, elenco)
}

/**
 * Devuelve el elenco votado (si ya votó), o null.
 */
export function getLocalVote(eventoId: string): string | null {
  return localStorage.getItem(`plum_vote_${eventoId}`)
}
