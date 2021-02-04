import Index from '../pages/index'

export interface DefaultEventArgs {
  page: Index,
  ws: WebSocket
}

export interface OnMessageArgs extends DefaultEventArgs {
  chunk: MessageEvent | Buffer
}