class TextPacket {
  constructor(type, args) {
    this.type = type
    this.args = args
  }

  parse() {
    const str    = Array.isArray(this.args) ? this.args.join('\n') : ''
    const buffer = Buffer.alloc(4 + str.length + 1)

    buffer.writeUInt32LE(this.type)
    buffer.write(str, 4)

    return buffer
  }
}

export default TextPacket