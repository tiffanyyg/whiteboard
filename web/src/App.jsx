import { Tldraw } from '@tldraw/tldraw'
import '@tldraw/tldraw/tldraw.css'
import { createWebSocketStore } from './wsStore'

function App() {
  const store = createWebSocketStore()

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Tldraw store={store} />
    </div>
  )
}

export default App
