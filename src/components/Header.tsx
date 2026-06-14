interface HeaderProps {
  onOpenExport: () => void
  onOpenImport: () => void
}

const Header = ({ onOpenExport, onOpenImport }: HeaderProps) => {
  return (
    <header className="app-header">
      <div className="header-logo">
        <span className="logo-icon">⚡</span>
        <h1 className="header-title">React Prop Editor</h1>
      </div>
      <div className="header-actions">
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
