import { promisify } from 'util'
import { inflate, deflate } from 'zlib'
import { randomBytes } from 'crypto'
import { User } from '../types/States'
import BetterMap from './Structs/BetterMap'

export const inflate_p = promisify(inflate)
export const deflate_p = promisify(deflate)

const Z_MAX_LEVEL = 9

export const genMac = () =>
  '02:' +
  randomBytes(5)
    .toJSON()
    .data.map(i => i.toString(16).padStart(2, '0'))
    .join(':')

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

export const pairToStr = (map: BetterMap) => {
  const res = []

  for (const [k, v] of map) {
    let pair = `${k}|`

    if (Array.isArray(v))
      pair += v.join('|')
    else pair += v

    res.push(pair)
  }

  return res.join('\n')
}

export const bufferDecode    = (buffer: Buffer) => buffer.toString('hex').match(/.{1,2}/g).join(' ')

export const buildPlayerInfo = (user: User) => {
  const data = new BetterMap()

  data.set('requestedName', 'CakeFairy')
    .set('f', 0)
    .set('protocol', 121)
    .set('game_version', 3.56)
    .set('fz', 7248232)
    .set('lmode', 0)
    .set('cbits', 0)
    .set('player_age', 100)
    .set('GDPR', 1)
    .set('hash2', 2147483647)
    .set('meta', user.meta || 'undefined')
    .set('fhash', -716928004)
    .set('rid', randomBytes(16).toString('hex'))
    .set('platformID', 0)
    .set('deviceVersion', 0)
    .set('country', 'us')
    .set('hash', 2147483647)
    .set('wk', randomBytes(16).toString('hex'))
    .set('zf', -1331849031)
    .set('mac', genMac())

  if (user.name)
    data.set('tankIDName', user.name)
      .set('tankIDPass', user.password)

  const str = pairToStr(data)

  return '\x02\x00\x00\x00' + str + '\x00' // todo: use text packet class to build this str
}