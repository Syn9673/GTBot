import Native from './Native'
import Websocket from 'ws'
import Config from './config.json'
import { ENetSocket } from './Socket'

class Proxy {
  public ws: Websocket.Server
  public netID: number
  public sockets: Map<number, ENetSocket>

  constructor() {
    this.ws = new Websocket.Server({ port: Config.ws.port })
    console.log('Websocket server started.')

    this.netID   = 1 // initialize netID
    this.sockets = new Map()

    Native.setCallbacks({
      conn: this.onConnect.bind(this),
      recv: this.onReceive.bind(this),
      dscn: this.onDisconnect.bind(this)
    })

    Native.init(Config.usingNewPacket)

    this.asyncListenEvents()
    console.log('Now listening for ENet Events.')

    this.wsListen()
    console.log('Now Listening to Websocket Events')
  }

  public onConnect(netID: number) {
    // fetch the socket from the cache via the netID
    const socket = this.sockets.get(netID)
    
    console.log('Successfully connected Socket:', socket?.data)
  }

  public onReceive(netID: number, chunk: Buffer) {
    // fetch the socket from the cache via the netID
    const socket = this.sockets.get(netID)

    // send the buffer to the socket
    socket?.send(chunk)
  }

  public onDisconnect(netID: number) {
    // fetch the socket from the cache via the netID
    const socket = this.sockets.get(netID)
    if (!socket) return

    console.log('Socket disconnected:', socket.data)

    // disconnect the socket
    socket.close()

    // delete the socket from cache
    this.sockets.delete(netID)
  }

  public asyncListenEvents() {
    const nonBlocking = () => new Promise((resolve) => (
        setImmediate(() => resolve(
            Native.peerService()
          )
        )
      )
    )

    const fn = async () => {
      while (true)
        await nonBlocking()
    }

    fn()
  }

  public wsListen() {
    this.ws.on('connection', (socket: ENetSocket) => {
      socket.on('close', () => {
        if (!socket.data) return

        // disconnect them from the ENet server
        Native.disconnect(socket.data.netID)

        // delete socket from cache
        this.sockets.delete(socket.data.netID)
      })

      // listen for messages of the socket
      socket.on('message', (chunk) => {
        const str = chunk.toString()

        // check for initialization of connections
        if (str.startsWith('INIT:')) {
          // init format: INIT:IP@PORT
          const host     = str.slice('INIT:'.length)
          let [ip, port] = host.split('@') as (string|number)[]

          if (typeof port !== 'number')
            port = parseInt(port)

          if (isNaN(port)) port = 17091
          if (!ip) ip = '127.0.0.1'

          // connect to the ENet Server
          socket.data = {
            netID: this.netID++,
            ip: socket['_socket'].remoteAddress.split('::ffff:').join(''),
            host: { ip: ip as string, port },
            hasInitialized: true,
          }

          // Create a new ENet Connection and store the returned ip
          Native.newConnection(ip as string, port)

          // put socket to cache
          this.sockets.set(socket.data.netID, socket)
        } else {
          if (!socket.data?.hasInitialized) return socket.close(4000, 'Connection hasn\'t initialized.')

          Native.send(socket.data.netID, Buffer.from(chunk as string))
        }
      })
    })
  }
}

export default Proxy