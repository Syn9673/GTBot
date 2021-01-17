import Websocket from 'ws'

export interface SocketConnection {
  ip: string
  port: number
}

export interface SocketData {
  netID: number
  ip: string
  host: SocketConnection
  hasInitialized: boolean
}

export interface ENetSocket extends Websocket {
  data: SocketData
}