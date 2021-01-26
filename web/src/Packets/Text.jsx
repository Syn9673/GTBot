import { PacketTypes } from "../Constants"

class Text {
  constructor(type, text) {
    this.type = type
    this.text = text
  }

  addText(str) {
    this.text.push(str)
  }

  static from(type, ...text) {
    return new Text(type, text)
  }

  toBuffer() {
    const str    = this.text.join('\n')
    const buffer = Buffer.alloc(str.length + 5)

    buffer.writeUInt32LE(this.type || PacketTypes.TEXT)
    buffer.write(str, 4)
    
    return buffer
  }
}

export default Text