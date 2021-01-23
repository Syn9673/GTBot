import Proxy from './structs/Proxy'
import Config from '../../config.json'
import cluster from 'cluster'
import util from 'util'

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

  const log = (...args: any[]) => {
    let str = ''

    for (const arg of args) {
      if (typeof arg === 'object')
        str += util.inspect(arg, true, 2, true)
      else str += arg

      str += ' ' 
    }

    cluster.worker.send(str.trim())
  }

  proxy.on('connect', (socket) => {
    log('Socket:', socket.data, 'connected to ENet Server.')
  })
  
  proxy.on('receive', (socket, chunk: Buffer) => {
    socket.send(chunk)
  })
  
  proxy.start()
  .then(() => log('Proxy Server started.'))
}