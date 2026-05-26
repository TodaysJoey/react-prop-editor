import type { EditorNode } from '../types/editor'
import { componentRegistry } from '../registry/componentRegistry'
import CheckboxField from './inspector/CheckboxField'
import SelectField from './inspector/SelectField'
import TextField from './inspector/TextField'

type ButtonProps = Extract<EditorNode, { type: 'Button' }>['props']
type ButtonVariant = Extract<EditorNode, { type: 'Button' }>['props']['variant']
type CardProps = Extract<EditorNode, { type: 'Card' }>['props']
type InputProps = Extract<EditorNode, { type: 'Input' }>['props']

type InspectorPaneProps = {
  component?: EditorNode
  onChangeComponent: (component: EditorNode) => void
}

const InspectorPane = ({ component, onChangeComponent }: InspectorPaneProps) => {
  if (!component) {
    return (
      <aside className="inspector-pane">
        <h2>Inspector</h2>
        <p className="inspector-empty">선택된 컴포넌트가 없습니다.</p>
      </aside>
    )
  }

  if (component.type === 'Button') {
    const updateButtonProp = <PropName extends keyof ButtonProps>(
      propName: PropName,
      value: ButtonProps[PropName],
    ) => {
      onChangeComponent({
        ...component,
        props: {
          ...component.props,
          [propName]: value,
        },
      })
    }

    const buttonPropsSchema = componentRegistry.Button.propsSchema

    return (
      <aside className="inspector-pane">
        <h2>Inspector</h2>
        {Object.entries(buttonPropsSchema).map(([propName, schema]) => {
          const buttonPropName = propName as keyof ButtonProps

          if (schema.type === 'text') {
            return (
              <TextField
                key={propName}
                label={schema.label}
                value={component.props[buttonPropName] as string}
                onChange={(value) => updateButtonProp(buttonPropName, value)}
              />
            )
          }

          if (schema.type === 'select') {
            return (
              <SelectField
                key={propName}
                label={schema.label}
                value={component.props[buttonPropName] as ButtonVariant}
                options={schema.options}
                onChange={(value) => updateButtonProp(buttonPropName, value)}
              />
            )
          }

          return (
            <CheckboxField
              key={propName}
              label={schema.label}
              checked={component.props[buttonPropName] as boolean}
              onChange={(checked) => updateButtonProp(buttonPropName, checked)}
            />
          )
        })}
      </aside>
    )
  }

  if (component.type === 'Card') {
    const updateCardProp = <PropName extends keyof CardProps>(
      propName: PropName,
      value: CardProps[PropName],
    ) => {
      onChangeComponent({
        ...component,
        props: {
          ...component.props,
          [propName]: value,
        },
      })
    }

    const cardPropsSchema = componentRegistry.Card.propsSchema

    return (
      <aside className="inspector-pane">
        <h2>Inspector</h2>
        {Object.entries(cardPropsSchema).map(([propName, schema]) => {
          const cardPropName = propName as keyof CardProps

          return (
            <TextField
              key={propName}
              label={schema.label}
              value={component.props[cardPropName]}
              onChange={(value) => updateCardProp(cardPropName, value)}
            />
          )
        })}
      </aside>
    )
  }

  const updateInputProp = <PropName extends keyof InputProps>(
    propName: PropName,
    value: InputProps[PropName],
  ) => {
    onChangeComponent({
      ...component,
      props: {
        ...component.props,
        [propName]: value,
      },
    })
  }

  const inputPropsSchema = componentRegistry.Input.propsSchema

  return (
    <aside className="inspector-pane">
      <h2>Inspector</h2>
      {Object.entries(inputPropsSchema).map(([propName, schema]) => {
        const inputPropName = propName as keyof InputProps

        if (schema.type === 'text') {
          return (
            <TextField
              key={propName}
              label={schema.label}
              value={component.props[inputPropName] as string}
              onChange={(value) => updateInputProp(inputPropName, value)}
            />
          )
        }

        return (
          <CheckboxField
            key={propName}
            label={schema.label}
            checked={component.props[inputPropName] as boolean}
            onChange={(checked) => updateInputProp(inputPropName, checked)}
          />
        )
      })}
    </aside>
  )
}

export default InspectorPane
