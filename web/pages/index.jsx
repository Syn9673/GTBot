import { Component } from 'react'
import { Button, Col, Container, Input, Row } from 'reactstrap'

import Config from '../../config.json'
import { deflate_p } from '../src/Utils'

// handlers
import OnMessage from '../src/Events/OnMessage'
import { PacketTypes, Z_MAX_LEVEL } from '../src/Constants'
import OnOpen from '../src/Events/OnOpen'
import OnClose from '../src/Events/OnClose'
import Text from '../src/Packets/Text'
import Card from '../components/Card'

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
      logs: [],
      showWorldDialog: false,
      worldName: '',
      player: {
        current: null,
        others: []
      }
    }
  }

  pushToLogs(...args) {
    let str = ''
    for (const arg of args)
      str += (typeof arg === 'string' ? arg : utils.inspect(arg, true, 2)) + ' '

    this.state.logs.push(str)
    this.setState({ logs: this.state.logs })
  }

  async joinWorld() {
    const text = Text.from(
      PacketTypes.ACTION,
      'action|validate_world',
      `name|${this.state.worldName}`
    )
    
    await this.send(text.toBuffer())
    
    text.text[0] = 'action|join_request'
    text.addText('invitedWorld|0')

    await this.send(text.toBuffer())

    this.pushToLogs('Joined world', this.state.worldName)
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
            <Card header='Server Host'>
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
                    disabled={this.state.connected}
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
            </Card>
            <Card header='User Account'>
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
            </Card>
            {this.state.showWorldDialog ? (
              <Card header='Join World'>
                <div className='mb-2'>
                  <Input
                    style={
                      { maxWidth: '240px' }
                    }
                    maxLength={26}
                    bsSize='sm'
                    placeholder='World Name'
                    onChange={(evt) => this.setState({ worldName: evt.target.value })}
                    className='bg-gradient-dark text-light'
                  />
                </div>
                <div className='text-center'>
                  <Button
                    outline
                    color='success'
                    size='sm'
                    className='shadow-none'
                    onClick={this.joinWorld.bind(this)}
                  >
                    Join
                  </Button>
                </div>
              </Card>
            ) : null}
            {/*this.state.player.current ? (
              <Card header='Current Player Data'>
                <p>X: {parseInt(this.state.player.current.pos.x) / 32}</p>
                <p>Y: {parseInt(this.state.player.current.pos.y) / 32}</p>
              </Card>
            ) : null*/}
          </Col>
          <Col md={8}>
            <Card header='Packet Logs'>
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
              <div
                className='mt-2'
                style={
                  { textAlign: 'right' }
                }   
              >
                <Button
                  outline
                  color='primary'
                  size='sm'
                  className='shadow-none'
                  onClick={() => this.setState({ logs: [] })}
                >
                  Clear
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>
    )
  }
}

export default Index