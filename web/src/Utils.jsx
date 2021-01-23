export const toKeyVal = (str) => {
  const map   = new Map()
  const lines = str.split('\n')

  for (const line of lines) {
    let [key, value] = line.split('|')
    value = value?.trim()

    map.set(key, value)
  }

  return map
}