import { Component } from 'react'
import {
  Button,
  Card,
  Container,
  CardBody,
  Col,
  Row,
  InputGroup,
  Input
} from 'reactstrap'

import OnClose from '../src/events/OnClose'
import OnError from '../src/events/OnError'
import OnMsg from '../src/events/OnMsg'
import OnOpen from '../src/events/OnOpen'

import utils from 'util'
import axios from 'axios'

import Config from '../../config.json'

class Index extends Component {
  constructor(props) {
    super(props)

    this.state = {
      ws: {
        host: null,
        port: null,
        connection: null
      },

      btnError: null,
      btnColor: 'primary',
      btnDisabled: false,
      btnText: 'Connect To Websocket',
      logs: [],
      wsErrored: false,
      connected: false,

      user: {
        name: '',
        pass: ''
      },

      server: {
        reqError: '',
        url: '',
        host: '',
        port: -1,
        meta: '',
        useNewPacket: false
      }
    }

    this.wsConnect    = this.wsConnect.bind(this)
    this.wsDisconnect = this.wsDisconnect.bind(this)
    this.updateHost   = this.updateHost.bind(this)
  }

  reset() {
    this.state.ws.connection?.close()

    this.state.server.reqError = null
    this.state.btnError        = null
    this.state.btnColor        = 'primary'
    this.state.btnDisabled     = false
    this.state.btnText         = 'Connect To Websocket'
    this.state.wsErrored       = false
    this.state.logs            = []
    this.state.connected       = false

    delete this.state.ws.connection
    this.setState(this.state)
  }

  async updateHost() {
    let int = 0

    // disable connect buttons and etc...
    this.state.btnDisabled     = true
    this.state.server.reqError = ''

    this.setState(this.state)

    // fetch here
    let res
    try {
      res = await axios(
        {
          url: `http://${Config.cors.host}:${Config.cors.port}/url`,
          method: 'POST',
          data: this.state.server.url,
          headers: {
            'content-type': 'text/plain'
          }
        }
      )
    } catch(err) {
      this.state.server.reqError = err.message

      int = -1
    }

    if (!res.data || res.data.err) {
      this.state.server.reqError = 'CORS Error: ' + res.data.msg

      int = -1
    } else if (typeof res.data === 'string') {
      const text = res.data.split('\n')
      const kv   = new Map()

      for (const line of text) {
        const [key, value] = line.split('|')
        kv.set(key, value?.trim())
      }

      const ip   = kv.get('server')
      const port = parseInt(kv.get('port'))
      const meta = kv.get('meta')
      const type = kv.get('type2')
      
      if (!ip || isNaN(port))
        this.state.server.btnError = 'Some information are missing from the given url.'
      else {
        this.state.server.host         = ip
        this.state.server.port         = port
        this.state.server.meta         = meta || 'undefined'
        this.state.server.useNewPacket = type === '1'
      
        this.log('Server information received.', `${ip}:${port}`)
      }
    }

    this.state.btnDisabled = false
    this.setState(this.state)

    return int
  }

  async wsConnect() {
    const int = await this.updateHost()

    if (int === -1) return

    if (!this.state.server.host || !this.state.server.port)
      return this.setState({ btnError: 'There is no host ip and port available. Did you update the server host?' })

    const filter = (e) => this.state.server.useNewPacket ? e.usingNewPacket : !e.usingNewPacket
    const nodes  = Config.web.wsServers.filter(filter)
    const len    = nodes.length

    const chosenNode = nodes[Math.floor(Math.random() * len)]
    if (!chosenNode)
      return this.setState({ btnError: 'No node is available for this kind of server.' })
    else {
      this.state.ws.host = chosenNode.host
      this.state.ws.port = chosenNode.port
    }

    this.state.btnError      = null
    this.state.btnColor      = 'primary'
    this.state.btnDisabled   = true
    this.state.ws.connection = new WebSocket(`ws://${this.state.ws.host}:${this.state.ws.port}`)
    this.state.wsErrored     = false

    this.state.ws.connection.binaryType = 'arraybuffer'

    this.state.ws.connection.onopen    = () => OnOpen(this, this.state.ws.connection)
    this.state.ws.connection.onerror   = () => OnError(this, this.state.ws.connection)
    this.state.ws.connection.onmessage = (chunk) => OnMsg(this, this.state.ws.connection, chunk)
    this.state.ws.connection.onclose   = (data) => OnClose(this, this.state.ws.connection, data)

    this.setState(this.state)
  }

  wsDisconnect() {
    this.state.ws.connection?.close()
    delete this.state.ws.connection

    this.setState(this.state)
  }

  log(...args) {
    let str = ''
    for (const arg of args)
      str += (typeof arg === 'string' ? arg : utils.inspect(arg, true, 2)) + ' '

    this.state.logs.push(str)
    this.setState(this.state)
  }

  render() {
    return (
      <Container>
        <Row className='justify-content-center my-9'>
        <Col>
            <center>
              <Card
                className='mb-2 bg-gradient-dark'
                style={{ maxWidth: '240px' }}
              >
                <CardBody className='text-center'>
                  <h4 className='text-light'>Growtopia Bot</h4>

                  <div className='mb-3'>
                    <div className='m-1'>
                      <Input
                        bsSize='sm'
                        className='bg-gradient-dark text-light border-primary'
                        type='text'
                        value={this.state.user.name}
                        placeholder='GrowID'
                        onChange={(evt) => {
                          this.state.user.name = evt.target.value
                          this.setState(this.state)
                        }}
                      />
                    </div>

                    <div className='m-1'>
                      <Input
                        bsSize='sm'
                        className='bg-gradient-dark text-light border-primary'
                        type='password'
                        value={this.state.user.pass}
                        placeholder='Password'
                        onChange={(evt) => {
                          this.state.user.pass = evt.target.value
                          this.setState(this.state)
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <Button
                      size='sm'
                      disabled={this.state.btnDisabled}
                      outline
                      className='shadow-none'
                      color={this.state.btnColor}
                      onClick={this.wsConnect}
                    >
                      {this.state.btnText}
                    </Button>
                  </div>

                  {this.state.btnError ? (
                    <p className='text-danger'>{this.state.btnError}</p>
                  ) : null}

                  {this.state.connected ? (
                    <div className='mt-2'>
                      <Button
                        size={'sm'}
                        outline
                        className='shadow-none'
                        color='danger'
                        onClick={this.wsDisconnect}
                      >
                        Disconnect
                      </Button>
                  </div>
                  ) : null}
                </CardBody>
              </Card>

              <Card
                className='mb-2 bg-gradient-dark'
                style={{ maxWidth: '240px' }}
              >
                <CardBody className='text-center'>
                  <h4 className='text-light'>Server URL</h4>

                  <div className='mb-3'>
                    <div className='m-1'>
                      <Input
                        bsSize='sm'
                        className='bg-gradient-dark text-light border-primary'
                        type='text'
                        value={this.state.server.url}
                        placeholder='Website URL'
                        onChange={(evt) => {
                          this.state.server.url = evt.target.value
                          this.setState(this.state)
                        }}
                      />
                    </div>
                  </div>
                  {this.state.server.reqError ? (
                    <div>
                      <p className='text-danger'>{this.state.server.reqError}</p>
                    </div>
                  ) : null}
                </CardBody>
              </Card>
            </center>
          </Col>
          <Col md={9}>
            <Card className='bg-gradient-dark'>
              <CardBody>
                <div className='text-center'>
                  <h4 className='text-light'>ENet Server Logs</h4>
                  <div
                    className='text-left'
                    style={
                      { 
                        overflow: 'auto',
                        maxHeight: '480px',
                        height: '480px',
                        backgroundColor: 'rgb(47, 47, 47)'
                      }
                    }
                  >
                    <div className='m-2'>
                      {this.state.logs.map((log, i) => (
                        <div
                          key={i + 1}
                          className='text-white mb-2'
                          style={
                            {
                              whiteSpace: 'pre-wrap',
                              backgroundColor: 'rgb(0, 0, 0, 0.0)'
                            }
                          }
                          onMouseEnter={(evt) => evt.target.style.backgroundColor = 'rgb(60, 60, 60)' }
                          onMouseLeave={(evt) => evt.target.style.backgroundColor = 'rgb(0, 0, 0, 0.0)' }
                        >
                          {log}
                        </div>
                      ))}
                    </div>
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