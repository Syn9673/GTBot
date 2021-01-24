export default function OnClose() {
  this.pushToLogs("Socket disconnected from proxy.")
  this.setState({ connected: false, fullyConnected: false })
}