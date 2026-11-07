export function showFlash(type, message) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('app:flash', { detail: { type, message } }))
}
