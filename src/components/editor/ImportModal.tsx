import { useState } from 'react'
import Modal from '../common/Modal'
import { useEditorStore } from '../../hooks/useEditorStore'
import { validateEditorState } from '../../utils/validation'

interface ImportModalProps {
  isOpen: boolean
  onClose: () => void
}

const ImportModal = ({ isOpen, onClose }: ImportModalProps) => {
  const importState = useEditorStore((state) => state.importState)
  const [jsonInput, setJsonInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleImport = () => {
    const result = validateEditorState(jsonInput)

    if (result.success) {
      importState(result.data.components, result.data.selectedComponentId)
      onClose()
    } else {
      setError(result.error)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="JSON 가져오기 (Import)">
      <div className="import-container">
        <p className="modal-description">
          저장해 둔 에디터 상태 JSON 문자열을 아래에 붙여넣고 적용하세요.
        </p>
        <textarea
          className={`modal-textarea ${error ? 'has-error' : ''}`}
          placeholder={`{\n  "components": [\n    {\n      "id": "btn-1",\n      "type": "Button",\n      "props": {\n        "label": "Click Me",\n        "variant": "primary",\n        "disabled": false\n      }\n    }\n  ],\n  "selectedComponentId": "btn-1"\n}`}
          value={jsonInput}
          onChange={(e) => {
            setJsonInput(e.target.value)
            if (error) setError(null)
          }}
        />
        {error && (
          <div className="validation-error-box">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{error}</span>
          </div>
        )}
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose} type="button">
            취소
          </button>
          <button className="btn-primary" onClick={handleImport} type="button">
            불러오기 적용
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ImportModal
