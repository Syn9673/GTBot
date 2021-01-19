import { getStringType, LoginInfo, MessageTypes } from '../Constants'
import TankPacket from '../Packets/TankPacket'
import { VariantDecode, VariantToString } from '../Utils/Tank'

const OnMsg = async (page, ws, chunk) => {
  try {
    chunk = Buffer.from(chunk.data)
  } catch { return page.log('Chunk parsing failed.') }

  switch (chunk[0]) {
    case MessageTypes.HELLO: {
      ws.send(
        LoginInfo({
          user: page.state.user
        }).parse()
      )
    
      page.log('Received Hello Packet. Login information sent.')
    } break;

    case MessageTypes.TEXT:
    case MessageTypes.ACTION: {
      page.log('Received Text data:\n', chunk.slice(4, chunk.length - 1).toString())
    } break;

    case MessageTypes.TANK: {
      const decoded = TankPacket.decode(chunk)
      if (decoded === -1)
        page.log('Received invalid tank packet with length:', chunk.length)
      else {

        if (decoded.data.type === 1)
          page.log(
            'Received packet:',
            `${getStringType(decoded.data.type)}
${VariantToString(
  VariantDecode(decoded.data)
)}`
          )
        else page.log('Received packet:', getStringType(decoded.data.type))
      }
    } break;
  }
}

export default OnMsg