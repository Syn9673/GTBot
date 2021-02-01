import { DefaultArgs, OnMessageArgs } from "../types/Events";
import { MessageTypes } from "../types/Packet";
import { inflate_p, sendChunk } from "./Utils";

export const OnOpen = async ({ data, setData, ws }: DefaultArgs) => {
  const { server, logs } = data

  logs.push('Connected to Websocket Node.')
  setData({ ...data, logs })

  await sendChunk(ws, `INIT:${server.ip}@${server.port}@${server.type}`)
}

export const OnMessage = async({
  data,
  setData,
  ws,
  chunk
}: OnMessageArgs) => {
  const { logs } = data

  chunk = await inflate_p(Buffer.from((chunk as MessageEvent).data))
  const messageType = chunk[0]

  switch (messageType) {
    case MessageTypes.HLO: {
      // TODO: Construct login packet

      break;
    }
  }
  //logs.push(bufferDecode(chunk))

  setData({ ...data, logs })
}