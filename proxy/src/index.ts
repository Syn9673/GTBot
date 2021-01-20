import Proxy from './structs/Proxy'
import Config from '../../config.json'

const proxy = new Proxy(Config.proxy.ws.port, Config.proxy.usingNewPacket)

proxy.on('connect', (socket) => {
  console.log('Socket:', socket.data, 'connected to ENet Server.')
})

proxy.on('receive', (socket, chunk: Buffer) => {
  proxy.write(socket, chunk)
})

proxy.start()
.then(() => console.log('Proxy Server started.'))