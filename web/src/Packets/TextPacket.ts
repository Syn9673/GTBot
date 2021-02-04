import { MessageTypes } from "../../types/Packet";

class TextPacket {
  constructor(public type: MessageTypes, public args: any[][]) {}

  public toBuffer() {
    let str = ''

    for (const arg of this.args) {
      const key  = arg.shift()
      const pair = `${key}|${arg.join('|')}`

      str += pair + '\n'
    }

    const buf = Buffer.alloc(4 + str.length)
    buf.writeUInt32LE(this.type)
    buf.write(str, 4)

    return buf
  }
}

export default TextPacket