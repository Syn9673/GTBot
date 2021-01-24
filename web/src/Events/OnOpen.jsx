import { toKeyVal } from "../Utils"
import axios from 'axios'
import Config from '../../../config.json'

export default async function OnOpen() {  
  const res = await axios({
    url: `http://${Config.cors.ip}:${Config.cors.port}/url`,
    method: 'POST',
    data: this.state.host.url,
    headers: {
      'content-type': 'text/plain'
    }
  })

  if (res.data.err)
    return this.setState({
      error: res.data.msg,
      connected: false,
      logs: []
    })

  this.pushToLogs('Websocket connection fully opened.')
  this.setState({ fullyConnected: true })

  const pairs = toKeyVal(res.data)
  
  let host = pairs.get('server')
  let port = parseInt(pairs.get('port'))

  const type = pairs.get('type2')
  const meta = pairs.get('meta')

  if (!host) host = '127.0.0.1'
  if (isNaN(port)) port = 17091

  this.state.user.meta = meta
  await this.send(`INIT:${host}@${port}@${type}`)
}