import path from 'path'

let native
try {
  native = require(`${path.resolve('../../')}/proxy/lib/build/Release/index.node`)
} catch(err) {
  throw new Error(err.message)
}

class Native {
  private instance

  constructor(public ip: string, public port: number) {
    this.instance = new native.Client(ip, port)
  }

  /**
   * Toggles the new packet protocol.
   * on = !on
   */
  public toggleProtocol() {
    this.instance.toggleProtocol()
  }

  /**
   * Set the emitter for listening to events.
   * @param emit The function to call when an event is received.
   */
  public setEmitter(emit: (...args: any[]) => any) {
    this.instance.setEmitter(emit)
  }

  /**
   * Creates a ENetHost* and initializes ENet.
   * @param usingNewPacket Whether or not to use the new packet protocol.
   */
  public create(usingNewPacket: boolean = false) {
    this.instance.create(usingNewPacket)
  }

  /**
   * Connects the client to the specified ip and port.
   */
  public connect() {
    this.instance.connect()
  }

  /**
   * Receive enqueued packets by calling this.
   * Make sure to call this function in a loop.
   */
  public service() {
    this.instance.service()
  }

  /**
   * De-initializes ENet.
   * Call this function when the process is quitting.
   */
  public deInit() {
    this.instance.deInit()
  }

  /**
   * Sends a packet to the server the peer is connected.
   * @param chunk The data to send.
   */
  public sendPacket(chunk: Buffer) {
    this.instance.sendPacket(chunk)
  }

  /**
   * Disconnects the peer from ENet.
   */
  public disconnect() {
    this.instance.disconnect()
  }

  /**
   * Disconnects the peer now.
   */
  public disconnectNow() {
    this.instance.disconnectNow()
  }
}

export default Native