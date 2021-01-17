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

    Native.init()

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

    // disconnect the socket
    socket?.close()

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
      // Initialize socket data
      socket.data = {
        netID: this.netID++,

        // Create a new ENet Connection and store the returned ip
        ip: Native.newConnection(Config.enet.ip, Config.enet.port)
      }

      // put socket data to the cache
      this.sockets.set(socket.data.netID, socket)

      socket.on('message', (data: Buffer) => {
        // received a from the socket
        // send it to the ENet Server
        Native.send(socket.data.netID, Buffer.from(data))
      })
    })
  }
}

export default Proxy