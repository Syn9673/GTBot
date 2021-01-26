import { VariantTypes } from "../Constants"

class Variant {
  constructor(data = {}) {
    this.data = data
  }

  static from(chunk) {
    chunk = chunk.slice(60)
    if (chunk.length < 1) return

    const result = {
      fn: '',
      args: []
    }

    let mempos  = 0
    const count = chunk[mempos++]

    for (let i = 0; i < count; i++) {
      const index = chunk[mempos++]
      const type  = chunk[mempos++]

      switch (type) {
        case VariantTypes.STRING: {
          const length = chunk.readUInt32LE(mempos)
          mempos += 4

          const string = chunk.toString('utf-8', mempos, mempos + length)
          mempos += length
          
          if (index === 0)
            result.fn = string
          else result.args.push(string)
        } break;

        case VariantTypes.INT:
        case VariantTypes.UINT: {
          const fn = type === VariantTypes.UINT ? 'readUInt32LE' : 'readInt32LE'
          result.args.push(chunk[fn](mempos))

          mempos += 4
        } break;

        case VariantTypes.FLOAT1:
        case VariantTypes.FLOAT2:
        case VariantTypes.FLOAT3: {
          const types     = Object.entries(VariantTypes)
          const floatType = types.find(i => i[1] === type)[0]

          const amount = parseInt(floatType.split('FLOAT')[1])
          const floats = []

          for (let i = 0; i < amount; i++) {
            floats.push(chunk.readFloatLE(mempos))
            mempos += 4
          }

          result.args.push(floats)
        } break;
      }
    }

    return new Variant(result)
  }

  [Symbol.toPrimitive](hint) {
    if (hint !== 'default' && hint !== 'string') throw new Error('invalid conversion to ' + hint)

    const strings = []
    strings.push(this.data.fn)

    for (const arg of this.data.args)
      if (Array.isArray(arg))
        strings.push(arg.join(', '))
      else strings.push(arg)

    return strings.map((v, i) => {
      if (i < 1) return v
      else return `[${i - 1}]: ${v}`
    }).join('\n')
  }
}

export default Variant