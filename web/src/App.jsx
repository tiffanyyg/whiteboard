import { Tldraw } from '@tldraw/tldraw'
import '@tldraw/tldraw/tldraw.css'

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Tldraw persistenceKey="board-instance" />
    </div>
  )
}

export default App

