const OnOpen = async (page, ws) => {
  page.log(`Connected to Websocket Server at`, new Date().toLocaleString())

  page.setState({
    connected: true,
    btnColor: 'success',
    btnDisabled: true,
    btnText: 'Connected To Websocket'
  })

  // send initialization message
  ws.send(`INIT:${page.state.server.host}@${page.state.server.port}`)
}

export default OnOpen