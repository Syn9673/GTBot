import Proxy from './structs/Proxy'
import Config from '../../config.json'
import cluster from 'cluster'
import { ENetSocket } from './structs/Types'

if (cluster.isMaster) {
  for (const _ of Config.nodes) {
    cluster.fork()

    cluster.on('message', (worker, message) => {
      console.log(`Worker [${worker.id}]: ${message}`)
    })

    cluster.on('online', (worker) => console.log(`Worker #${worker.id} now online.`))
  }
} else {
  const node  = Config.nodes[cluster.worker.id - 1]
  const proxy = new Proxy(node.port)

  proxy.on('connect', (socket) => {
    proxy.log('Socket:', socket.data, 'connected to ENet Server.')
  })
  
  proxy.on('receive', (socket, chunk: Buffer) => {
    proxy.send(socket, chunk)
  })

  proxy.on('disconnect', (socket: ENetSocket) => {
    proxy.log('Socket', socket.data, 'disconnected from ENet Server')
    socket.close()

    socket.data.client.deInit()
  })
  
  proxy.start()
  .then(() => proxy.log('Proxy Server started.'))
}