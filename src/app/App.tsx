import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import PreviewPane from '../components/PreviewPane'
import InspectorPane from '../components/InspectorPane'
import type { ComponentItem } from '../types/component'
import '/src/styles/App.css'

function App() {
  const [components, setComponents] = useState<ComponentItem[]>([
    {
      id: 'btn-1',
      type: 'Button',
      props: {
        label: 'Save',
        variant: 'primary',
        disabled: false,
      },
    },
    {
      id: 'card-1',
      type: 'Card',
      props: {
        title: 'Card Title',
        description: 'Card description',
      },
    },
    {
      id: 'input-1',
      type: 'Input',
      props: {
        placeholder: 'Type here',
        disabled: false,
      },
    },
  ])

  const [selectedComponentId, setSelectedComponentId] = useState('btn-1')
  const selectedComponent = components.find((component) => component.id === selectedComponentId)

  const updateComponent = (nextComponent: ComponentItem) => {
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
