import { PacketTypes, TankPacketNames, Z_MAX_LEVEL } from '../Constants'
import TankPacket from '../Packets/Tank'
import { buildLoginData, inflate_p, toKeyVal } from '../Utils'
import Variant from '../Packets/Variant'
import Text from '../Packets/Text'

export default async function OnMessage(chunk) {
  chunk = Buffer.from(chunk.data)
  chunk = await inflate_p(chunk, { level: Z_MAX_LEVEL })

  switch (chunk[0]) {
    case PacketTypes.HELLO: {
      this.pushToLogs('Received HELLO Packet.')

      // send login info
      await this.send(buildLoginData(this.state.user))
      this.pushToLogs('Built and sent login info.')
    } break;

    case PacketTypes.TEXT:
    case PacketTypes.ACTION: {
      this.pushToLogs('Received text packet:', chunk.toString('utf-8', 4, chunk.length - 1).trim())
    } break;

    case PacketTypes.TANK: {
      const tank = TankPacket.decode(chunk)
      if (tank === -1)
        return this.pushToLogs('Received invalid tank packet with length:', chunk.length)

      const tankName = TankPacketNames[tank.data.type]
      let str        = `Received ${tankName}`

      switch (tankName) {
        case 'PACKET_CALL_FUNCTION': {
          const variant = Variant.from(chunk)
          str += ': ' + variant

          this.pushToLogs(str)

          switch (variant.data.fn) {
            case 'OnSuperMainStartAcceptLogonHrdxs47254722215a': {
              const text = Text.from(2, 'action|enter_game')
              await this.send(text.toBuffer())
  
              this.pushToLogs('Sent enter_game action.')
              this.setState({ showWorldDialog: true })
            } break;

            case 'OnSpawn': {
              if (typeof variant.data.args[0] !== 'string') return
              const pair = toKeyVal(variant.data.args[0])

              const type   = pair.get('type')
              const netID  = pair.get('netID')
              const userID = pair.get('userID')
              const [x, y] = pair.get('posXY')

              const playerObj = {
                netID,
                userID,
                pos: { x, y }
              }

              if (type === 'local')
                this.state.player.current = playerObj
              else this.state.player.others.push(playerObj)  

              this.setState(this.state)
            } break;
          }
        } break;
      }
    } break;
  }
}