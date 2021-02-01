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
  CardActions
} from '@material-ui/core'

import AccountCircle from '@material-ui/icons/AccountCircle'
import FindInPage from '@material-ui/icons/FindInPage'
import Lock from '@material-ui/icons/Lock'

import React, { useState } from 'react'
import axios from 'axios'

import { Main } from '../types/States'
import { toKeyVal } from '../src/Utils'
import { OnMessage, OnOpen } from '../src/Events'

const Index = () => {
  const [data, setData] = useState<Main>({
    server: {},
    user: {},
    host: '',
    err: '',
    logs: [],
    connDisabled: false
  })

  const startConnection = () => {
    const node = Config.nodes[Math.floor(Math.random() * Config.nodes.length)]

    data.ws = new WebSocket(`ws://${node.ip}:${node.port}`)
    data.ws.binaryType = 'arraybuffer'

    data.ws.onopen = () => OnOpen({
      data,
      setData,
      ws: data.ws
    })

    data.ws.onmessage = (chunk) => OnMessage({
      data,
      setData,
      ws: data.ws, 
      chunk
    })

    data.ws.onclose = () => {
      console.log('Connection closed.')
      setData({ ...data, connDisabled: false })
    }

    setData(data)
  }

  const sendPostToHost = async () => {
    data.connDisabled = true
    data.err          = null

    const { cors } = Config

    const res = await axios({
      method: 'POST',
      url: `http://${cors.ip}:${cors.port}/url`,
      data: data.host,
      headers: {
        'content-type': 'text/plain'
      }
    })

    if (res.data?.err)
      return setData({ ...data, err: res.data.msg, connDisabled: false })

    const pairs = toKeyVal(res.data)
    data.server = {
      ip: pairs.get('server')?.toString(),
      port: parseInt(pairs.get('port')?.toString()),
      type: pairs.get('type2')?.toString()
    }

    setData(data)
    startConnection()
  }

  const connButtonClick = () => {
    setData({ ...data, err: null, connDisabled: true })

    sendPostToHost()
  }

  return (
    <Container
      style={{ marginTop: '20px', marginBottom: '20px' }}
    >
      <Grid
        container
        direction='row'
        justify='center'
        alignItems='center'
        spacing={2}
      >
        <Grid item>
          <Card>
            <CardHeader
              title='User Account'
              subheader='Input your account details for a specific server.'
            />
            <CardContent
              style={{ paddingTop: 0 }}
            >
              <form>
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
                        setData({
                          ...data,
                          user: { name: evt.target.value, password: data.user?.password },                         
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
                        setData({
                          ...data,
                          user: { name: data.user?.name, password: evt.target.value }                          
                        })
                      }
                    />
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>
        <Grid item>
          <Card>
            <CardHeader
              title='Server Host'
              subheader='Place the host url to connect to.'
            />
            <CardContent style={{ paddingTop: 0 }}>
              <form>
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
                        setData({ ...data, host: evt.target.value })
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
              >
                <Grid item style={{ width: '100%' }}>
                  <Button
                    color='primary'
                    variant='contained'
                    style={{ width: '100%' }}
                    disableElevation
                    onClick={connButtonClick}
                    disabled={data.connDisabled}
                  >
                    Connect
                  </Button>
                </Grid>
              </Grid>
            </CardActions>
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
              subheader={`Content count: ${data.logs.length}`}
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
                  {data.logs.map((content, index) => (
                    <p
                      key={index}
                      style={{ whiteSpace: 'pre-wrap' }}
                    >
                      {content}
                    </p>
                  ))}
                </div>
              </Paper>
            </CardContent>
            <CardActions>
              {data.err ? (
                <div>
                  <p
                    style={{ color: '#f44336' }}
                  >
                    Error: {data.err}
                  </p>
                </div>
              ) : null}
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}

export default Index