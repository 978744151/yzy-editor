export function copyToClickboard(val) {
  const textArea = document.createElement('textArea')
  textArea.value = val
  textArea.style.width = 0
  textArea.style.position = 'fixed'
  textArea.style.left = '-999px'
  textArea.style.top = '10px'
  textArea.setAttribute('readonly', 'readonly')
  document.body.appendChild(textArea)

  textArea.select()
  document.execCommand('copy')
  document.body.removeChild(textArea)
}
