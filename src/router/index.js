export function getCurrentRoute () {
  return window.location.pathname.replace(/^\/+/, '') || 'home'
}

export function navigateTo (path) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new Event('popstate'))
}
