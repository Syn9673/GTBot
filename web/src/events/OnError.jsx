const OnError = async (page, ws) => {
  page.reset()

  page.setState({
    wsErrored: true,
    btnError: 'Websocket connection resulted in an error. Please try again.',
    btnColor: 'danger',
    btnDisabled: false
  })
}

export default OnError