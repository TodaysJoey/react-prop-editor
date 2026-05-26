import type { EditorNode } from '../types/editor'
import { componentRegistry } from '../registry/componentRegistry'

type SidebarProps = {
  components: EditorNode[]
  selectedComponentId: string
  onSelectComponent: (id: string) => void
}

const Sidebar = ({ components, selectedComponentId, onSelectComponent }: SidebarProps) => {
  return (
    <div className="sidebar">
      {components.map((component) => (
        <button
          className={component.id === selectedComponentId ? 'sidebar-item selected' : 'sidebar-item'}
          key={component.id}
          onClick={() => onSelectComponent(component.id)}
          type="button"
        >
          {componentRegistry[component.type].label}
        </button>
      ))}
    </div>
  )
}

export default Sidebar
