import { useState } from 'react'
import { ConfirmDialog } from './confirm-dialog'

/**
 * Imperative confirmation — the caller must render the returned element:
 *
 *   const [confirm, confirmEl] = useConfirm()
 *   if (await confirm({ title, description })) doThing()
 *   return <>{confirmEl}…</>
 */
export function useConfirm() {
  const [state, setState] = useState(null)

  function confirm({ title, description, confirmLabel, destructive = true }) {
    return new Promise((resolve) => {
      setState({ title, description, confirmLabel, destructive, resolve })
    })
  }

  function handleOpenChange(next) {
    if (!next && state) {
      state.resolve(false)
      setState(null)
    }
  }

  async function handleConfirm() {
    if (!state) return
    state.resolve(true)
    setState(null)
  }

  const element = state ? (
    <ConfirmDialog
      open
      onOpenChange={handleOpenChange}
      title={state.title}
      description={state.description}
      confirmLabel={state.confirmLabel}
      destructive={state.destructive}
      onConfirm={handleConfirm}
    />
  ) : null

  return [confirm, element]
}
