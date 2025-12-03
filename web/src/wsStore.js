import { createTLStore, defaultShapeUtils } from '@tldraw/tldraw'

export function createWebSocketStore() {
  const store = createTLStore({
    shapeUtils: defaultShapeUtils,
  })

  const url = `ws://${window.location.hostname}:8080/ws`
  const socket = new WebSocket(url)

  socket.onopen = () => {
    console.log("Connected to WebSocket server")
  }

  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data)

    if (msg.type === "load") {
      store.loadSnapshot(msg.data)
      return
    }

    if (msg.type === "patch") {
      store.patchState(msg.data)
    }
  }

  store.onPatch((patch) => {
    socket.send(JSON.stringify({ type: "patch", data: patch }))
  })

  return store
}
