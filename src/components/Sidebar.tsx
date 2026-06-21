import { useEditorStore } from '../hooks/useEditorStore'
import { componentRegistry } from '../registry/componentRegistry'

const Sidebar = () => {
  const components = useEditorStore((state) => state.present.components)
  const selectedComponentId = useEditorStore((state) => state.present.selectedComponentId)
  const setSelectedComponentId = useEditorStore((state) => state.setSelectedComponentId)

  return (
    <div className="sidebar">
      {components.map((component) => (
        <button
          className={
            component.id === selectedComponentId ? 'sidebar-item selected' : 'sidebar-item'
          }
          key={component.id}
          onClick={() => setSelectedComponentId(component.id)}
          type="button"
        >
          {componentRegistry[component.type].label}
        </button>
      ))}
    </div>
  )
}

export default Sidebar
