import crypto from 'crypto'
import BetterMap from './BetterMap'

import { deflate, inflate } from 'zlib'
import { promisify } from 'util'

export const deflate_p = promisify(deflate)
export const inflate_p = promisify(inflate)

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

export const buildMac = () => {
  const arr = []
  for (let i = 0; i < 5; i++)
    arr.push(crypto.randomBytes(1)[0])

  return '02:' + arr.map(i => i.toString(16)).join(':')
}

export const buildLoginData = (user = {}) => {
  const data = new BetterMap()

  data.set('requestedName', 'CakeFairy')
    .set('f', 1)
    .set('protocol', 117)
    .set('game_version', 3.52)
    .set('fz', 7134376)
    .set('cbits', 0)
    .set('player_age', 100)
    .set('GDPR', 1)
    .set('hash2', 2147483647)
    .set('meta', user.meta || 'undefined')
    .set('fhash', -716928004)
    .set('rid', crypto.randomBytes(16).toString('hex'))
    .set('platformID', 0)
    .set('deviceVersion', 0)
    .set('country', 'us')
    .set('hash', 2147483647)
    .set('wk', crypto.randomBytes(16).toString('hex'))
    .set('zf', -1331849031)
    .set('mac', buildMac())

  if (user.name)
    data.set('tankIDName', user.name)
      .set('tankIDPass', user.pass)

  const entries = data.entries()
  let str = ''

  for (const entry of entries) {
    const pair = entry.join('|')
    str += pair + '\n'
  }

  return '\x02\x00\x00\x00' + str
}