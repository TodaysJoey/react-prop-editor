import type { ComponentItem } from '../types/component'

type SidebarProps = {
  components: ComponentItem[]
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
          {component.type}
        </button>
      ))}
    </div>
  )
}

export default Sidebar
