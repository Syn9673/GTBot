export interface Server {
  ip?: string
  port?: number
  type?: string
}

export interface User {
  name?: string
  password?: string
  meta?: string
}

export interface Main {
  server: Server
  user: User
  host: string
  err: string
  logs: string[]
  ws?: WebSocket
  connDisabled?: boolean
}