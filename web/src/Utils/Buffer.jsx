export const BufferToString = (buf) => {
  let str = 'Buffer <'

  for (let i = 0; i < buf.length; i++) {
    str += buf[i].toString(16).padStart(2, '0')

    if (i !== buf.length - 1)
      str += ' '
    else str += '>'
  }

  return str
}