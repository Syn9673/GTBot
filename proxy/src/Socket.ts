import Websocket from 'ws'

export interface SocketData {
  netID: number
  ip: string
}

export interface ENetSocket extends Websocket {
  data: SocketData
}