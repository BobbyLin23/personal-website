export function useLoginModal() {
  const open = useState('login-modal-open', () => false)

  function openLoginModal() {
    open.value = true
  }

  function closeLoginModal() {
    open.value = false
  }

  return {
    open,
    openLoginModal,
    closeLoginModal,
  }
}
