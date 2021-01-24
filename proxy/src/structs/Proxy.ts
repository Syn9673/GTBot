import Native from './Native'
import { EventEmitter } from 'events'
import { ENetSocket } from './Types'

import { Server } from 'ws'

import { constants, deflate, inflate } from 'zlib'
import { promisify, inspect } from 'util'

import cluster from 'cluster'

const deflate_p = promisify(deflate)
const inflate_p = promisify(inflate)

class Proxy extends EventEmitter {
  public ws: Server

  constructor(private port: number) {
    super()
  }

  public log(...args: any[]) {
    let str = ''

    for (const arg of args) {
      if (typeof arg === 'object')
        str += inspect(arg, true, 2, true)
      else str += arg

      str += ' ' 
    }

    cluster.worker.send(str.trim())
  }

  public async send(socket: ENetSocket, data: any) {
    if (typeof data === 'string' || typeof data === 'number')
      data = Buffer.from(data.toString())
    else if (typeof data === 'object' && !Buffer.isBuffer(data))
      data = Buffer.from(JSON.stringify(data))

    data = await deflate_p(data, { level: constants.Z_MAX_LEVEL })
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

      socket.on('close', (code, reason) => {
        this.log('Socket Closed with Code:', code, 'with reason:', reason || 'None')
        socket.data.client?.disconnect()
      })

      socket.on('message', async (chunk: Buffer) => {
        try {
          chunk = await inflate_p(chunk)
        } catch(err) {
          console.log(err)
          return await this.send(socket, 'Failed decompressing message')
        }

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
        } else
          socket.data.client.sendPacket(chunk)
      })
    })
  }
}

export default Proxy