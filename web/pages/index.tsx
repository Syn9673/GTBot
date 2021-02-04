import Config from '../../config.json'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  TextField,
  Paper,
  CardActions,
  Typography
} from '@material-ui/core'

import AccountCircle from '@material-ui/icons/AccountCircle'
import FindInPage from '@material-ui/icons/FindInPage'
import Lock from '@material-ui/icons/Lock'

import { Component } from 'react'
import axios from 'axios'

import { Main } from '../types/States'
import { toKeyVal } from '../src/Utils'
import { OnMessage, OnOpen } from '../src/Events'

import fileDownload from 'js-file-download'

class Index extends Component {
  public state: Main

  constructor(props) {
    super(props)

    this.state = {
      server: {},
      user: {},
      host: '',
      err: '',
      logs: [],
      connDisabled: false,
      downloads: [],
      dID: 0
    }

    this.startConnection = this.startConnection.bind(this)
    this.sendPostToHost  = this.sendPostToHost.bind(this)
    this.connButtonClick = this.connButtonClick.bind(this)
  }

  public componentWillUnmount() {
    this.state.ws?.close(4000)
  }

  private startConnection() {
    const node = Config.nodes[Math.floor(Math.random() * Config.nodes.length)]

    this.state.ws = new WebSocket(`ws://${node.ip}:${node.port}`)
    this.state.ws.binaryType = 'arraybuffer'

    this.state.ws.onopen = () => OnOpen({
      page: this,
      ws: this.state.ws
    })

    this.state.ws.onmessage = (chunk) => OnMessage({
      page: this,
      ws: this.state.ws,
      chunk
    })

    this.state.ws.onclose = (ev) => {
      console.log('Connection closed.')

      if (ev.code !== 4000)
        this.setState({ ...this.state, connDisabled: false, connected: false })
    }

    this.setState(this.state) 
  }

  private async sendPostToHost() {
    this.state.connDisabled = true
    this.state.err          = null

    this.state.logs.push(`Sending request to CORS proxy with url: ${this.state.host}`)
    this.setState(this.state)

    const { cors } = Config
    const res = await axios({
      method: 'POST',
      url: `http://${cors.ip}:${cors.port}/url`,
      data: this.state.host,
      headers: {
        'content-type': 'text/plain'
      }
    }).catch(err => (
      { data: { msg: err.message, err: true } }
    ))

    if (res.data?.err)
      return this.setState({
        ...this.state,
        err: res.data.msg === 'Network Error' ? 'Failed sending request to CORS proxy.' : res.data.msg,
        connDisabled: false
    })

    this.state.logs.push(`CORS request successful! Data:\n${res.data}`)

    const pairs = toKeyVal(res.data)
    this.state.server = {
      ip: pairs.get('server')?.toString(),
      port: parseInt(pairs.get('port')?.toString()),
      type: pairs.get('type2')?.toString()
    }

    if (!this.state.user)
      this.state.user = {}

      this.state.user.meta = pairs.get('meta')?.toString()

    this.setState(this.state)
    this.startConnection()
  }

  private connButtonClick() {
    this.setState({ ...this.state, err: null, connDisabled: true })

    setTimeout(() => this.sendPostToHost(), 1000) // add some delay for effects?
  }

  public render() {
    return (
      <Container
        style={{ marginTop: '100px', marginBottom: '100px' }}
      >
        <Grid
          container
          direction='row'
          justify='center'
          alignItems='center'
          spacing={2}
        >
          <Grid item md={4}>
            <Card>
              <CardHeader
                title='Download Extra Data Logs'
                subheader='Download the extra data from tank packets here.'
              />
              <CardContent>
                <Paper
                  variant='outlined'
                  style={{
                    maxHeight: '120px',
                    overflow: 'auto',
                    height: '120px',
                    textAlign: 'center'
                  }}
                >
                  {this.state.downloads.map((file, index) => (
                    <Button
                      color='primary'
                      variant='outlined'
                      size='small'
                      onClick={() => fileDownload(file.content, file.name)}
                      key={index}
                      style={{ margin: '2px' }}
                    >
                      {file.name}
                    </Button>
                  ))}
                </Paper>
              </CardContent>
            </Card>
          </Grid>
          <Grid item md={4}>
            <Card>
              <CardHeader
                title='Server Host'
                subheader='Place the host url to connect to.'
              />
              <CardContent style={{ paddingTop: 0 }}>
                <form onSubmit={(e) => e.preventDefault()}>
                  <Grid
                    alignItems='flex-end'
                    container
                    spacing={1}
                  >
                    <Grid item>
                      <FindInPage color='primary' />
                    </Grid>
                    <Grid item>
                      <TextField
                        label='Server Host URL'
                        onChange={(evt) =>
                          this.setState({ ...this.state, host: evt.target.value })
                        }
                      />
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
              <CardActions>
                <Grid
                  container
                  direction='column'
                  justify='center'
                  alignItems='center'
                  spacing={1}
                >
                  <Grid item style={{ width: '100%' }}>
                    <Button
                      color='primary'
                      variant='outlined'
                      style={{ width: '100%' }}
                      disableElevation
                      onClick={this.connButtonClick}
                      disabled={this.state.connDisabled}
                    >
                      Connect
                    </Button>
                  </Grid>
                  <Grid item style={{ width: '100%' }}>
                    <Button
                      style={{ width: '100%' }}
                      color='secondary'
                      variant='outlined'
                      disabled={!this.state.connected}
                      onClick={() => {
                        this.state.ws?.close()

                        this.setState(this.state)
                      }}
                    >
                      Disconnect
                    </Button>
                  </Grid>
                </Grid>
              </CardActions>
            </Card>
          </Grid>
          <Grid item md={4}>
            <Card>
              <CardHeader
                title='User Account'
                subheader='Input your account details for a specific server.'
              />
              <CardContent style={{ paddingTop: 0 }}>
                <form onSubmit={(e) => e.preventDefault()}>
                  <Grid
                    alignItems='flex-end'
                    container
                    spacing={1}
                  >
                    <Grid item>
                      <AccountCircle color='primary' />
                    </Grid>
                    <Grid item>
                      <TextField
                        label='GrowID'
                        onChange={(evt) =>
                          this.setState({
                            ...this.state,
                            user: { name: evt.target.value, password: this.state.user?.password },                         
                          })
                        }
                      />
                    </Grid>
                  </Grid>
                  <Grid
                    spacing={1}
                    container
                    alignItems='flex-end'
                  >
                    <Grid item>
                      <Lock color='primary' />
                    </Grid>
                    <Grid item>
                      <TextField
                        label='Password'
                        type='password'
                        onChange={(evt) =>
                          this.setState({
                            ...this.state,
                            user: { name: this.state.user?.name, password: evt.target.value }                          
                          })
                        }
                      />
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Grid
          container
          direction='row'
          justify='center'
          alignItems='center'
          spacing={2}
        >
          <Grid item xs={12}>
            <Card>
              <CardHeader 
                title='Packet Logs'
                subheader={`Content count: ${this.state.logs.length}`}
              />
              <CardContent>
                <Paper
                  variant='outlined'
                  style={{
                    height: '480px',
                    maxHeight: '480px',
                    overflow: 'auto'
                  }}
                >
                  <div style={{ margin: '10px' }}>
                    {this.state.logs.map((content, index) => (
                      <p          
                        key={index}
                        style={{ whiteSpace: 'pre-wrap' }}
                        onMouseEnter={(evt) =>
                          evt.target['style'].backgroundColor = localStorage.getItem('theme') === 'false' ? '#313131' : 'grey'
                        }
                        onMouseLeave={
                          (evt) => evt.target['style'].backgroundColor = 'transparent'
                        }
                      >
                        {content.trim()}
                      </p>
                    ))}
                  </div>
                </Paper>
                <Button
                  variant='outlined'
                  disableElevation
                  style={{ marginTop: '5px', marginRight: '2px' }}
                  color='primary'
                  onClick={() => {
                    this.state.logs      = []
                    this.state.downloads = []

                    this.setState(this.state)
                  }}
                >
                  Clear Logs
                </Button>

                <Button
                  variant='outlined'
                  disableElevation
                  style={{ marginTop: '5px' }}
                  color='primary'
                  onClick={() => {
                    this.state.downloads = []
                    this.setState(this.state)
                  }}
                >
                  Clear Extra Data
                </Button>
              </CardContent>
              <CardActions>              
                {this.state.err ? (
                  <div>
                    <Typography
                      component='p'
                      color='secondary'
                    >
                      Error: {this.state.err}
                    </Typography>
                  </div>
                ) : null}
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Container>
    )
  }
}

export default Index