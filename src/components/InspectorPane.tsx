import { useEditorStore } from '../hooks/useEditorStore'
import { componentRegistry } from '../registry/componentRegistry'
import type { EditorNode } from '../types/editor'
import CheckboxField from './inspector/CheckboxField'
import SelectField from './inspector/SelectField'
import TextField from './inspector/TextField'

type PropValue = string | boolean

const InspectorPane = () => {
  const component = useEditorStore((state) =>
    state.present.components.find((c) => c.id === state.present.selectedComponentId),
  )
  const updateComponent = useEditorStore((state) => state.updateComponent)

  if (!component) {
    return (
      <aside className="inspector-pane">
        <h2>Inspector</h2>
        <p className="inspector-empty">선택된 컴포넌트가 없습니다.</p>
      </aside>
    )
  }

  const propsSchema = componentRegistry[component.type].propsSchema
  const props = component.props as Record<string, PropValue>

  const updateProp = (propName: string, value: PropValue) => {
    const updatedComponent = {
      ...component,
      props: {
        ...props,
        [propName]: value,
      },
    } as EditorNode

    updateComponent(updatedComponent)
  }

  return (
    <aside className="inspector-pane">
      <h2>Inspector</h2>
      {Object.entries(propsSchema).map(([propName, schema]) => {
        if (schema.type === 'text') {
          return (
            <TextField
              key={propName}
              label={schema.label}
              value={props[propName] as string}
              onChange={(value) => updateProp(propName, value)}
            />
          )
        }

        if (schema.type === 'select') {
          return (
            <SelectField
              key={propName}
              label={schema.label}
              value={props[propName] as string}
              options={schema.options}
              onChange={(value) => updateProp(propName, value)}
            />
          )
        }

        return (
          <CheckboxField
            key={propName}
            label={schema.label}
            checked={props[propName] as boolean}
            onChange={(checked) => updateProp(propName, checked)}
          />
        )
      })}
    </aside>
  )
}

export default InspectorPane
