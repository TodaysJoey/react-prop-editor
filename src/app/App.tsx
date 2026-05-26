import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import PreviewPane from '../components/PreviewPane'
import InspectorPane from '../components/InspectorPane'
import { componentRegistry } from '../registry/componentRegistry'
import type { EditorNode } from '../types/editor'
import '/src/styles/App.css'

function App() {
  const [components, setComponents] = useState<EditorNode[]>([
    {
      id: 'btn-1',
      type: 'Button',
      props: { ...componentRegistry.Button.defaultProps },
    },
    {
      id: 'card-1',
      type: 'Card',
      props: { ...componentRegistry.Card.defaultProps },
    },
    {
      id: 'input-1',
      type: 'Input',
      props: { ...componentRegistry.Input.defaultProps },
    },
  ])

  const [selectedComponentId, setSelectedComponentId] = useState('btn-1')
  const selectedComponent = components.find((component) => component.id === selectedComponentId)

  const updateComponent = (nextComponent: EditorNode) => {
    setComponents((currentComponents) =>
      currentComponents.map((component) =>
        component.id === nextComponent.id ? nextComponent : component,
      ),
    )
  }

  return (
    <main className="app-layout">
      <Sidebar
        components={components}
        selectedComponentId={selectedComponentId}
        onSelectComponent={setSelectedComponentId}
      ></Sidebar>
      <PreviewPane component={selectedComponent}></PreviewPane>
      <InspectorPane
        component={selectedComponent}
        onChangeComponent={updateComponent}
      ></InspectorPane>
    </main>
  )
}

export default App
