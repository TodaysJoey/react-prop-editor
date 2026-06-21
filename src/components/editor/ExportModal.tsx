import { useState } from 'react'
import Modal from '../common/Modal'
import { useEditorStore } from '../../hooks/useEditorStore'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
}

const ExportModal = ({ isOpen, onClose }: ExportModalProps) => {
  const components = useEditorStore((state) => state.present.components)
  const selectedComponentId = useEditorStore((state) => state.present.selectedComponentId)
  const [copied, setCopied] = useState(false)

  const exportData = {
    components,
    selectedComponentId,
  }

  const jsonString = JSON.stringify(exportData, null, 2)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy state JSON: ', err)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="JSON 내보내기 (Export)">
      <div className="export-container">
        <p className="modal-description">
          현재 에디터의 편집 상태를 나타내는 직렬화된 JSON 데이터입니다. 복사해서 나중에 다시 불러올
          수 있습니다.
        </p>
        <textarea
          className="modal-textarea"
          value={jsonString}
          readOnly
          onClick={(e) => (e.target as HTMLTextAreaElement).select()}
        />
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose} type="button">
            닫기
          </button>
          <button className="btn-primary copy-btn" onClick={handleCopy} type="button">
            {copied ? '복사 완료! ✓' : '클립보드 복사'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ExportModal
