const OnClose = async (page, ws, data) => {
  if (!page.state.wsErrored)
    page.reset()
}

export default OnClose