## Proxy Protocol
The proxy is a websocket connection with simple instructions required.  

First, is that all data sent to the websocket connection **must** be compressed at the **maximum** level with `zlib`. If decompression fails at the proxy side, it will return a compressed message containing `Failed decompressing message`.  

And all data received from the websocket server is also compressed the same way.  
Lastly, there is only **one** available command for the proxy. All other data is sent to the ENet Server.  

The command is the `INIT` command, with the structure of `INIT:IP@PORT@TYPE`. Where `IP` is the ip of the ENet server to connect to. `PORT` being the port, and `TYPE` is whether or not to enable growtopia's new packet protocol. `1` if you want to enable it, or any value will other than `1` will not enable it.  

Once a websocket connection closes, the ENet connection should be closed as well.  
Same for the other way around.  

Example:  
```js
// native zlib library
const {
  // i do not recommend using the sync methods, instead use the ones that require callbacks and convert them to promises.
  inflateSync,
  deflateSync,
  constants
} = require('zlib')

// nodejs ws client
const Websocket = require('ws')

const pack   = (buf) => deflateSync(buf, { level: constants.Z_MAX_LEVEL })
const unpack = (buf) => inflateSync(buf, { level: constants.Z_MAX_LEVEL })

const ws = new Websocket('ws://127.0.0.1')
ws.bufferType = 'arraybuffer'

ws.on('open',
  () => ws.send(pack('INIT:213.179.209.168@17197@1')) /*real gt server*/
)

ws.on('message', (chunk) => {
  // unpack compressed data
  chunk = unpack(Buffer.from(chunk))

  // handle the decompressed data here
})
```