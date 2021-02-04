import { OnMessageArgs, DefaultEventArgs } from "../types/Events";
import { MessageTypes } from "../types/Packet";
import TankPacket from "./Packets/TankPacket";
import { buildPlayerInfo, inflate_p, sendChunk } from "./Utils";

export const OnOpen = async ({ page, ws }: DefaultEventArgs) => {
  page.state.logs.push('Connected to Websocket Node.')
  page.state.connected = true

  page.setState(page.state)

  const { server } = page.state

  await sendChunk(ws, `INIT:${server.ip}@${server.port}@${server.type}`)
}

export const OnMessage = async({ page, ws, chunk }: OnMessageArgs) => {
  const { user } = page.state

  chunk = await inflate_p(Buffer.from((chunk as MessageEvent).data))
  const messageType = chunk[0]

  switch (messageType) {
    case MessageTypes.HLO: {
      page.state.logs.push('Received HELLO Packet from server.')
      await sendChunk(ws, buildPlayerInfo(user))
    } break;

    case MessageTypes.STR:
    case MessageTypes.ACT: {
      console.log(chunk, chunk.toString())
    } break;

    case MessageTypes.TNK: {
      const tank = TankPacket.fromBuffer(chunk)
      if (tank === -1) return page.state.logs.push('Invalid tank packet received.')

      const toStr = tank.toString(page)
      if (toStr === -1) return page.state.logs.push('Invalid tank decoding mode.')

      page.state.logs.push(`Received Tank Packet: ${tank.getStringType()}\n${toStr}`)
    } break;

    default: {
      page.state.logs.push(`Received unknown packet.
Type: ${messageType}
Content Raw Bytes: ${chunk.toString('hex').match(/.{1,2}/g).join(' ')}
Content as String: ${chunk.toString()}
`)
    } break;
  }

  //logs.push(bufferDecode(chunk))
  page.setState(page.state)
}