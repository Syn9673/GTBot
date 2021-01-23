import Native from './Native'
import { EventEmitter } from 'events'
import { ENetSocket } from './Types'

import { Server } from 'ws'

class Proxy extends EventEmitter {
  public ws: Server

  constructor(private port: number) {
    super()
  }

  private nonBlock(socket: ENetSocket, cb: any) {
    const fn = () => new Promise((resolve) =>  (
        setImmediate(() => (
            resolve(cb())
          )
        )
      )
    )

    const exec = async () => {
      while (socket.data.connected)
        await fn()
    }

    exec()
  }

  private getHost(cmd: string, data: string) {
    data = data.slice(cmd.length + 1)
    let [ip, port, newProtocol] = data.split('@')

    if (!ip) ip = '127.0.0.1'
    if (!port) port = '17091'
    
    return {
      ip,
      port: parseInt(port),
      newProtocol: newProtocol === '1'
    }
  }

  public async start() {
    this.ws = new Server({ port: this.port, host: '0.0.0.0' })

    this.ws.on('listening', () => console.log('Websocket on port:', this.port, 'is online.'))

    this.ws.on('connection', (socket: ENetSocket) => {
      socket.data = {
        client: null,
        initialized: false,
        connected: false,
        ip: socket['_socket'].remoteAddress.split('::ffff:').join('')
      }

      socket.on('message', async (chunk: Buffer) => {
        const str = chunk.toString()

        if (str.startsWith('INIT:') && !socket.data.initialized) {
          const { ip, port, newProtocol } = this.getHost('INIT', str)

          socket.data.client      = new Native(ip, port)
          socket.data.initialized = true

          socket.data.client.create(newProtocol)
          socket.data.client.connect()

          socket.data.connected = true

          const emitter = (...args) => {
            const cmd = args.shift()
            this.emit(cmd, socket, ...args);
          }

          this.nonBlock(socket, socket.data.client.service.bind(socket.data.client))
          socket.data.client.setEmitter(emitter)
        }
      })
    })
  }
}

export default Proxy