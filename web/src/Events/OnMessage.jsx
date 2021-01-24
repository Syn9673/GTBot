import { PacketTypes, TankPacketNames, Z_MAX_LEVEL } from '../Constants'
import TankPacket from '../Packets/Tank';
import { buildLoginData, inflate_p, VariantDecode, VariantToString } from '../Utils';

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

      switch (TankPacketNames[tank.data.type]) {
        case 'PACKET_CALL_FUNCTION': {
          const variant = VariantDecode(tank.data)

          this.pushToLogs(`Received Variant Packet:
${VariantToString(variant)}`)
        } break;
      }
    } break;
  }
}