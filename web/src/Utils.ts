import { promisify } from 'util'
import { inflate, deflate } from 'zlib'
import { randomBytes } from 'crypto'

export const inflate_p = promisify(inflate)
export const deflate_p = promisify(deflate)

const Z_MAX_LEVEL = 9

export const genMac = () => '02:' + (randomBytes(4) as any).map(i => i.toString(16)).join(':') 

export const sendChunk = async(ws: WebSocket, chunk: Buffer | string) => {
  chunk = await deflate_p(chunk, { level: Z_MAX_LEVEL })
  return ws.send(chunk)
}

export const toKeyVal = (str: string = '') => {
  const data  = new Map<string, string|string[]>()
  const lines = str.split('\n')

  for (const line of lines) {
    let [key, ...values] = line.split('|')
    values = values.map(i => {
      if (i.startsWith('|'))
        i = i.slice(1)

      return i?.trim()
    })

    data.set(key, values.length <= 1 ? values.join('|') : values)
  }

  return data
}

export const bufferDecode = (buffer: Buffer) => buffer.toString('hex').match(/.{1,2}/g).join(' ')