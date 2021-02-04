import { AppProps } from 'next/app'
import Head from 'next/head'
import Config from '../../config.json'
import { useState, useEffect } from 'react'

import '../assets/index.css'

import 'fontsource-roboto'
import {
  createMuiTheme,
  CssBaseline,
  IconButton,
  MuiThemeProvider
} from '@material-ui/core'

import Brightness3 from '@material-ui/icons/Brightness3'
import Brightness5 from '@material-ui/icons/Brightness5'

const App = ({ Component, pageProps }: AppProps) => {
  const [id, setTheme] = useState(false)
  const currTheme      = createMuiTheme({
    palette: Config.web.palettes[Number(id)] as any
  })

  const [hidden, setHidden] = useState(true)

  useEffect(() => {
    setTheme(localStorage.getItem('theme') === 'true')
    setHidden(false)
  }, [])

  return hidden ? null : (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <MuiThemeProvider theme={currTheme}>
        <CssBaseline />
        <Component {...pageProps} />

        <IconButton
          onClick={() => {
            setTheme(!id)
            localStorage.setItem('theme', (!id).toString())
          }}
          color='primary'
          style={{
            position: 'fixed',
            bottom: '5px',
            right: '5px'
          }}
        >
          {id ? <Brightness3 style={{ color: '#212121' }} /> : <Brightness5 style={{ color: '#ffeb3b' }} />}
        </IconButton>
      </MuiThemeProvider>
    </>
  )
}

export default App