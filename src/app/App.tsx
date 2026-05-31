import Sidebar from '../components/Sidebar'
import PreviewPane from '../components/PreviewPane'
import InspectorPane from '../components/InspectorPane'
import '/src/styles/App.css'

function App() {
  return (
    <main className="app-layout">
      <Sidebar />
      <PreviewPane />
      <InspectorPane />
    </main>
  )
}

export default App
