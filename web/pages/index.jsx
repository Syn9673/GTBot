import { Component } from 'react'
import { Button, Card, CardBody, CardHeader, Col, Container, Input, Row } from 'reactstrap'

import Config from '../../config.json'
import { deflate_p } from '../src/Utils'

// handlers
import OnMessage from '../src/Events/OnMessage'
import { Z_MAX_LEVEL } from '../src/Constants'
import OnOpen from '../src/Events/OnOpen'
import OnClose from '../src/Events/OnClose'

class Index extends Component {
  constructor(props) {
    super(props)

    this.state = {
      user: {
        name: '',
        pass: '',
        meta: ''
      },

      host: {
        url: '',
        ip: '',
        port: -1
      },

      node: -1,

      ws: null,

      error: '',

      connected: false,
      fullyConnected: false,
      logs: []
    }
  }

  pushToLogs(...args) {
    let str = ''
    for (const arg of args)
      str += (typeof arg === 'string' ? arg : utils.inspect(arg, true, 2)) + ' '

    this.state.logs.push(str)
    this.setState({ logs: this.state.logs })
  }

  async send(data) {
    const ws = this.state.ws

    if (typeof data === 'string' || typeof data === 'number')
      data = Buffer.from(data.toString())

    data = await deflate_p(data, { level: Z_MAX_LEVEL })
    ws.send(data)
  }

  componentDidMount() {
    if (Config.nodes.length > 0)
      this.state.node = Math.floor(Math.random() * Config.nodes.length)

    this.setState(this.state)
  }

  onHostUrlUpdate(evt) {
    this.setState({
      error: null,
      host: {
        url: evt.target.value,
        ip: this.state.host.ip,
        port: this.state.host.port
      }
    })
  }

  updateLoginInfo(evt) {
    const name = evt.target.name === 'name' ? evt.target.value : this.state.user.name
    const pass = evt.target.name === 'pass' ? evt.target.value : this.state.user.pass

    this.setState({
      user: {
        name,
        pass,
        meta: this.state.user.meta
      }
    })
  }

  nodeConnect() {
    this.state.error = null
    this.state.logs  = []

    if (this.state.node < 0)
      return this.setState({ error: 'There are no available nodes to connect through.' })

    this.state.connected = true

    const node    = Config.nodes[this.state.node]
    this.state.ws = new WebSocket(`ws://${node.ip}:${node.port}`)

    this.state.ws.binaryType = 'arraybuffer'

    this.state.ws.onopen    = OnOpen.bind(this)
    this.state.ws.onclose   = OnClose.bind(this)
    this.state.ws.onmessage = OnMessage.bind(this)

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
                      readOnly={this.state.connected}
                    />
                  </div>

                  <div>
                    <Button
                      color='success'
                      className='shadow-none mb-2'
                      size='sm'
                      outline
                      onClick={this.nodeConnect.bind(this)}
                      disabled={this.state.connected}
                    >
                      Connect
                    </Button>

                    {this.state.error ? (
                      <p className='mt-2 text-danger'>Error: {this.state.error}</p>
                    ) : null}
                  </div>
                  {this.state.fullyConnected ? (
                    <div>
                      <Button
                        color='danger'
                        className='shadow-none'
                        size='sm'
                        outline
                        onClick={() => this.state.ws.close()}
                      >
                        Disconnect
                      </Button>
                    </div>
                  ) : null}
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
                <center>
                  <div className='mb-2'>
                    <Input
                      style={
                        { maxWidth: '240px' }
                      }
                      bsSize='sm'
                      name='url'
                      name='name'
                      placeholder='Username'
                      onChange={this.updateLoginInfo.bind(this)}
                      className='bg-gradient-dark text-light'
                    />
                  </div>
                  <div className='mb-2'>
                    <Input
                      style={
                        { maxWidth: '240px' }
                      }
                      bsSize='sm'
                      name='url'
                      name='pass'
                      placeholder='Password'
                      type='password'
                      onChange={this.updateLoginInfo.bind(this)}
                      className='bg-gradient-dark text-light'
                    />
                  </div>
                </center>
              </CardBody>
            </Card>
          </Col>
          <Col md={8}>
            <Card className='bg-gradient-dark'>
              <CardHeader
                className='bg-gradient-dark text-center'
                style={
                  { padding: 0 }
                }
              >
                <h3 className='text-light'>Packet Logs</h3>
              </CardHeader>
              <CardBody>
                <div
                  className='bg-gradient-dark border'
                  style={
                    {
                      height: '480px',
                      maxHeight: '480px',
                      overflow: 'auto'
                    }
                  }
                >
                  <div className='m-2'>
                    {this.state.logs.map((s, i) => (
                        <div
                          key={i}
                          className='text-light mb-3'
                          style={
                            { whiteSpace: 'pre', padding: 0 }
                          }
                          onMouseEnter={(evt) => evt.target.style.backgroundColor = 'rgb(42, 42, 42)'}
                          onMouseLeave={(evt) => evt.target.style.backgroundColor = 'transparent'}
                        >
                          {s}
                        </div>
                        )
                      )
                    }
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    )
  }
}

export default Index