import { useState } from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import PreviewPane from '../components/PreviewPane'
import InspectorPane from '../components/InspectorPane'
import ExportModal from '../components/editor/ExportModal'
import ImportModal from '../components/editor/ImportModal'
import '/src/styles/App.css'

function App() {
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)

  return (
    <div className="app-container">
      <Header
        onOpenExport={() => setIsExportOpen(true)}
        onOpenImport={() => setIsImportOpen(true)}
      />
      <main className="app-layout">
        <Sidebar />
        <PreviewPane />
        <InspectorPane />
      </main>

      {isExportOpen && <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />}
      {isImportOpen && <ImportModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />}
    </div>
  )
}

export default App
