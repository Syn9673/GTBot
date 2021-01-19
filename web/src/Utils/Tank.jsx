import { VariantTypes } from "../Constants"

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

  str += variant.fn + '\n'
  for (let i = 0; i < variant.args.length; i++) {
    let arg = variant.args[i]

    if (typeof arg === 'object')
      arg = JSON.stringify(arg)

    str += `[${i}]: ${arg}\n`
  }

  str += `Delay (ms): ${variant.delay}`

  return str
}