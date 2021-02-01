import { Dispatch, SetStateAction } from "react";
import { Main } from "./States";

export interface DefaultArgs {
  data: Main,
  setData: Dispatch<SetStateAction<Main>>,
  ws: WebSocket
}

export interface OnMessageArgs extends DefaultArgs {
  chunk: MessageEvent | Buffer
}