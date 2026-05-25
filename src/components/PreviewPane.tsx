import type { ComponentType } from 'react'
import type { ComponentItem } from '../types/component'
import { componentRegistry } from '../registry/componentRegistry'

type PreviewPaneProps = {
  component?: ComponentItem
}

const PreviewPane = ({ component }: PreviewPaneProps) => {
  const renderPreview = () => {
    if (!component) {
      return <p className="preview-empty">선택된 컴포넌트가 없습니다.</p>
    }

    const PreviewComponent = componentRegistry[component.type].preview as ComponentType<
      typeof component.props
    >

    return <PreviewComponent {...component.props} />
  }

  return (
    <div className="preview-pane">
      <div className="preview-stage">{renderPreview()}</div>
    </div>
  )
}

export default PreviewPane
