/** Ctrl+K (Windows/Linux) or Cmd+K (macOS). */
export function isCommandPaletteShortcut(event) {
  return (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k'
}
