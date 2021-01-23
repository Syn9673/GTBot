import { Component } from 'react'
import { Button, Card, CardBody, CardHeader, Col, Container, Input, Row } from 'reactstrap'

import Config from '../../config.json'
import axios from 'axios'

import { toKeyVal, deflate_p, inflate_p } from '../src/Utils'

class Index extends Component {
  constructor(props) {
    super(props)

    this.state = {
      user: {
        name: '',
        password: ''
      },

      host: {
        url: '',
        ip: '',
        port: -1
      },

      node: -1,

      ws: null,

      error: '',

      connected: false
    }
  }

  componentDidMount() {
    if (Config.nodes.length > 0)
      this.state.node = Math.floor(Math.random() * Config.nodes.length)

    this.setState(this.state)
  }

  onHostUrlUpdate(evt) {
    this.setState({
      host: {
        url: evt.target.value,
        ip: this.state.host.ip,
        port: this.state.host.port
      }
    })
  }

  nodeConnect() {
    this.setState({
      error: null
    })

    if (this.state.node < 0)
      return this.setState({ error: 'There are no available nodes to connect through.' })

    this.state.connected = true

    const node    = Config.nodes[this.state.node]
    this.state.ws = new WebSocket(`ws://${node.ip}:${node.port}`)

    this.state.ws.binaryType = 'arraybuffer'

    this.state.ws.onopen = async () => {
      console.log('Websocket connection opened.')
      
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
          connected: false
        })

      const pairs = toKeyVal(res.data)
      
      let host = pairs.get('server')
      let port = parseInt(pairs.get('port'))

      const type = pairs.get('type2')

      if (!host) host = '127.0.0.1'
      if (isNaN(port)) port = 17091

      this.state.ws.send(`INIT:${host}@${port}@${type}`)
    }

    this.state.ws.onclose = () => this.setState({ connected: false })

    this.state.ws.onmessage = async (chunk) => {
      chunk = Buffer.from(chunk.data)

      console.log(chunk.toString(), chunk)
    }

    this.setState(this.state)
  }

  componentWillUnmount() {
    this.setState({ ws: null })
  }

  render() {
    return (
      <Container className='my-9'>
        <Row>
          <Col md={4}>
            <Card className='bg-gradient-dark text-light text-center'>
              <CardHeader
                className='bg-gradient-dark'
                style={
                  { padding: '0' }
                }
              >
                <h3 className='text-light'>Server Host</h3>
              </CardHeader>
              <CardBody>
                <center>
                  <div className='mb-2'>
                    <Input
                      style={
                        { maxWidth: '240px' }
                      }
                      bsSize='sm'
                      name='url'
                      placeholder='Server Host IP'
                      onChange={this.onHostUrlUpdate.bind(this)}
                      className='bg-gradient-dark text-light'
                    />
                  </div>

                  <div>
                    <Button
                      color='primary'
                      className='shadow-none'
                      size='sm'
                      onClick={this.nodeConnect.bind(this)}
                      disabled={this.state.connected}
                    >
                      Connect
                    </Button>

                    {this.state.error ? (
                      <p className='mt-2 text-danger'>Error: {this.state.error}</p>
                    ) : null}
                  </div>
                </center>
              </CardBody>
            </Card>
            <Card className='bg-gradient-dark text-light text-center my-2'>
              <CardHeader
                className='bg-gradient-dark'
                style={
                  { padding: '0' }
                }
              >
                <h3 className='text-light'>User Account</h3>
              </CardHeader>
              <CardBody>
                
              </CardBody>
            </Card>
          </Col>
          <Col>
            <Card>
              <h4>Hello World2</h4>
            </Card>
          </Col>
        </Row>
      </Container>
    )
  }
}

export default Index