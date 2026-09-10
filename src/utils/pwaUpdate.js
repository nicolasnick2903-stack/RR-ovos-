// Força o navegador a checar se há uma versão nova publicada e recarrega já
// com ela. O service worker usa clientsClaim + autoUpdate (ver vite.config.js).
export async function forcarAtualizacao() {
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.getRegistration()
      if (reg) await reg.update()
    } catch {
      // offline ou sem SW — o reload abaixo ainda ajuda
    }
  }
  window.location.reload()
}
