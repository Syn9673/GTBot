import Native from './Native'
import { EventEmitter } from 'events'
import { ENetSocket, ProxyOptions } from './Types'

import { Server } from 'ws'
import { inflate, deflate } from 'zlib'
import { promisify } from 'util'

const inflate_p = promisify(inflate)
const deflate_p = promisify(deflate)

class Proxy extends EventEmitter {
  public ws: Server

  constructor(private port: number, private newProtocol?: boolean) {
    super()
  }

  public async write(socket: ENetSocket, data: Buffer) {
    data = await deflate_p(data)
    socket.send(data)
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
    let [ip, port] = data.split('@')

    if (!ip) ip = '127.0.0.1'
    if (!port) port = '17091'

    return {
      ip,
      port: parseInt(port)
    }
  }

  public async start() {
    this.ws = new Server({ port: this.port })

    this.ws.on('connection', (socket: ENetSocket) => {
      socket.data = {
        client: null,
        initialized: false,
        connected: false,
        ip: socket['_socket'].remoteAddress.split('::ffff:').join('')
      }

      socket.on('message', async (chunk: Buffer) => {
        chunk = await inflate_p(chunk)
        const str = chunk.toString()

        if (str.startsWith('INIT:') && !socket.data.initialized) {
          const { ip, port } = this.getHost('INIT', str)

          socket.data.client      = new Native(ip, port)
          socket.data.initialized = true

          socket.data.client.create(!!this.newProtocol)
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