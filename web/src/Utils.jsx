import crypto from 'crypto'
import BetterMap from './BetterMap'

import { deflate, inflate } from 'zlib'
import { promisify } from 'util'
import { VariantTypes } from './Constants'

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

  return arr.map(i => i.toString(16)).join(':')
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

export const VariantDecode = (tank) => {
  const { info: delay, net, state } = tank
  const { extra: data }             = tank.data

  const argCount = data[0]
  let pos = 1

  const result = {
    fn: null,
    args: [],
    delay,
    net,
    state
  }

  for (let i = 0; i < argCount; i++) {
    // skip 1 byte since it will be the index
    pos++

    if (!data[pos]) break

    const type = data[pos++]
    switch (type) {
      case VariantTypes.STRING: {
        const size = data.readUInt32LE(pos)
        pos += 4

        const str = data.toString('utf-8', pos, pos + size)
        pos += size

        if (!i)
          result.fn = str
        else result.args.push(str)
      } break;

      case VariantTypes.UINT:
      case VariantTypes.INT: {
        result.args.push(data[type === VariantTypes.INT ? 'readInt32LE' : 'readUInt32LE'](pos))

        pos += 4
      } break;

      case VariantTypes.FLOAT1:
      case VariantTypes.FLOAT2:
      case VariantTypes.FLOAT3: {
        // get type within the name of the constant
        const types = Object.entries(VariantTypes)
        const count = parseInt(
          types.find(c => c[1] === type)[0]
            .slice('FLOAT'.length)
        )

        const floats = []

        for (let i = 0; i < count; i++) {
          floats.push(data.readFloatLE(pos))
          pos += 4
        }

        result.args.push(floats)
      } break;
    }
  }

  return result
}

export const VariantToString = (variant) => {
  let str = ''

  str += 'FN_CALL: ' + variant.fn + '\n'
  for (let i = 0; i < variant.args.length; i++) {
    let arg = variant.args[i]

    if (typeof arg === 'object')
      arg = JSON.stringify(arg)

    str += `[${i}]: ${arg}\n`
  }

  str += `Delay (ms): ${variant.delay}`

  return str
} 