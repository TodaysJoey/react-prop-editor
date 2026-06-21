import { useEditorStore } from '../hooks/useEditorStore'

interface HeaderProps {
  onOpenExport: () => void
  onOpenImport: () => void
}

const Header = ({ onOpenExport, onOpenImport }: HeaderProps) => {
  const canUndo = useEditorStore((state) => state.past.length > 0)
  const canRedo = useEditorStore((state) => state.future.length > 0)
  const undo = useEditorStore((state) => state.undo)
  const redo = useEditorStore((state) => state.redo)

  return (
    <header className="app-header">
      <div className="header-logo">
        <span className="logo-icon">⚡</span>
        <h1 className="header-title">React Prop Editor</h1>
      </div>
      <div className="header-actions">
        <button
          aria-label="Undo"
          className="btn-secondary header-btn history-btn"
          disabled={!canUndo}
          onClick={undo}
          title="Undo (Cmd+Z)"
          type="button"
        >
          ↶
        </button>
        <button
          aria-label="Redo"
          className="btn-secondary header-btn history-btn"
          disabled={!canRedo}
          onClick={redo}
          title="Redo (Cmd+Shift+Z)"
          type="button"
        >
          ↷
        </button>
        <button className="btn-secondary header-btn" onClick={onOpenImport} type="button">
          📥 JSON 가져오기
        </button>
        <button className="btn-primary header-btn" onClick={onOpenExport} type="button">
          📤 JSON 내보내기
        </button>
      </div>
    </header>
  )
}

export default Header
