import path from 'path'
const native = require(`${path.resolve('../../')}/proxy/lib/build/Release/index.node`)

export type ENetOnConnect  = (netID: number) => any
export type ENetOnReceive  = (netID: number, chunk: Buffer) => any
export type ENetDisconnect = (netID: number) => any

export interface Callbacks {
  conn: ENetOnConnect
  recv: ENetOnReceive
  dscn: ENetDisconnect
}

class Native {
  /**
   * Initialize ENet.
   * @param usingNewPacket Whether or not to use the new packet protocol.
   */
  public static init(usingNewPacket: boolean = true) {
    native.init(usingNewPacket)
  }

  /**
   * Sets the callbacks to be called natively on events.
   * @param callbacks The callbacks to be passed natively.
   */
  public static setCallbacks(callbacks: Callbacks) {
    native.set_cb(callbacks.conn, callbacks.recv, callbacks.dscn)
  }

  /**
   * Creates a new connection.
   * @param ip The ip address to connect to.
   * @param host The port to connect with the ip.
   */
  public static newConnection(ip: string, port: number) {
    native.new_conn(ip, port)
  }

  /**
   * Checks for Events everytime this is called.
   * If there are events, it will call the necessary callbacks.
   */
  public static peerService() {
    native.peer_service()
  }

  /**
   * Sends packets to a specific peer.
   * @param netID The netID of the peer. 
   * @param chunk The chunk/packet to send.
   */
  public static send(netID: number, chunk: Buffer) {
    native.send(netID, chunk)
  }

  /**
   * Disconnect a specific peer.
   * @param netID The netID of the peer.
   */
  public static disconnect(netID: number) {
    native.disconnect(netID)
  }
}

export default Native