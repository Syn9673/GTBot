import WebSocket from "ws";
import Native from "./Native";

export interface ProxyOptions {
  ip: string
  port: number
  useNewProtocol: boolean
  websocketPort: number
}

export interface SocketData {
  client: Native
  initialized: boolean
  connected: boolean
  ip: string
}

export interface ENetSocket extends WebSocket {
  data: SocketData
}