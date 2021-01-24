import Vector2 from "../Vector2"

class TankPacket {
  constructor(data = {}) {
    this.data = data
  }

  static from(data) {
    return new TankPacket(data)
  }

  static decode(chunk) {
    if (chunk.length < 60)
      return -1

    const pos = new Vector2()
    pos.x = chunk.readFloatLE(28), pos.y = chunk.readFloatLE(32)

    const spd = new Vector2()
    spd.x = chunk.readFloatLE(36), spd.y = chunk.readFloatLE(40)

    const punch = new Vector2()
    punch.x = chunk.readInt32LE(48), punch.y = chunk.readInt32LE(52)

    const data = {
      type: chunk.readUInt32LE(4),
      net: {
        id: chunk.readInt32LE(8),
        target: chunk.readInt32LE(12)
      },
      state: chunk.readInt32LE(16),
      info: chunk.readInt32LE(20),
      pos,
      spd,
      punch,
      data: {
        length: chunk.readUInt32LE(56),
        extra: chunk.slice(60)
      }
    }

    return new TankPacket(data)
  }
}

export default TankPacket 