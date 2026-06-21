import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import PreviewPane from '../components/PreviewPane'
import InspectorPane from '../components/InspectorPane'
import ExportModal from '../components/editor/ExportModal'
import ImportModal from '../components/editor/ImportModal'
import { useEditorStore } from '../hooks/useEditorStore'
import '/src/styles/App.css'

function App() {
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const undo = useEditorStore((state) => state.undo)
  const redo = useEditorStore((state) => state.redo)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isExportOpen || isImportOpen || event.key.toLowerCase() !== 'z') {
        return
      }

      const isUndoKey = event.metaKey && !event.shiftKey
      const isRedoKey = event.metaKey && event.shiftKey

      if (isUndoKey) {
        event.preventDefault()
        undo()
      }

      if (isRedoKey) {
        event.preventDefault()
        redo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isExportOpen, isImportOpen, redo, undo])

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
