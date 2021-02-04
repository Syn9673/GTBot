import Index from '../../pages'
import { TankData, TankOffsets, TankPacketNames } from '../../types/Packet'
import Vector2 from '../Structs/Vector2'

class TankPacket {
  constructor(public data: TankData) {}

  public getStringType() {
    return TankPacketNames[this.data.type]
  }

  public toString(page: Index, mode: 'hex' | 'str' = 'str') { // TODO: Add support for hex mode
    if (mode === 'str') {
      const pairs = Object.entries(this.data)
      
      return `${this.getStringType()}
${pairs.map(
  ([k, v]) => {
    k = k.toUpperCase()

    if (typeof v === 'string' || typeof v === 'number')
      return `${k}|${v}`
    else {
      if (typeof v === 'function') {
        const res = v()

        if (Buffer.isBuffer(res)) {
          const id = (page.state.dID++).toString()

          page.state.downloads.push({
            name: `${id}.dat`,
            content: res,
            id
          })

          page.setState(page.state)
          return `${k}|Use Download ID: ${id}`
        }
      } else if (Array.isArray(v))
        return `${k}|${v.join('|')}`
      else {
        const valuePairs = Object.entries(v)
        return `${k}|${valuePairs.map(([_k, _v]) => `${_k}: ${_v}`).join('|')}`
      }
    }
  }
).join('\n')}`
    } else return -1
  }

  public static fromBuffer(buffer: Buffer) {
    if (buffer.length < 60) return -1

    const data: TankData = {
      type: buffer[TankOffsets.PACKET_TYPE],
      net: {
        current: buffer.readInt32LE(TankOffsets.PACKET_NET_ID_CURRENT),
        target: buffer.readInt32LE(TankOffsets.PACKET_NET_ID_TARGET)
      },

      state: buffer.readInt32LE(TankOffsets.PACKET_STATE),
      info: buffer.readInt32LE(TankOffsets.PACKET_INFO),

      pos: new Vector2(
        buffer.readFloatLE(TankOffsets.PACKET_PLAYER_X_POS),
        buffer.readFloatLE(TankOffsets.PACKET_PLAYER_Y_POS)
      ),

      speed: new Vector2(
        buffer.readFloatLE(TankOffsets.PACKET_PLAYER_X_SPEED),
        buffer.readFloatLE(TankOffsets.PACKET_PLAYER_Y_SPEED)
      ),

      punch: new Vector2(
        buffer.readInt32LE(TankOffsets.PACKET_PLAYER_X_PUNCH),
        buffer.readInt32LE(TankOffsets.PACKET_PLAYER_Y_PUNCH)
      ),
    }

    const extraDataLen = buffer.readUInt32LE(TankOffsets.PACKET_EXTRA_DATA_LEN)
    if (extraDataLen >= 1)
      data.extra = () => buffer.slice(TankOffsets.PACKET_EXTRA_DATA)

    return new TankPacket(data)
  }
}

export default TankPacket