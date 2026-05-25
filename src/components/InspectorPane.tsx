import type { ComponentItem } from '../types/component'
import CheckboxField from './inspector/CheckboxField'
import SelectField from './inspector/SelectField'
import TextField from './inspector/TextField'

type ButtonVariant = Extract<ComponentItem, { type: 'Button' }>['props']['variant']
const buttonVariantOptions = ['primary', 'secondary'] as const

type InspectorPaneProps = {
  component?: ComponentItem
  onChangeComponent: (component: ComponentItem) => void
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
    const handleLabelChange = (label: string) => {
      onChangeComponent({
        ...component,
        props: {
          ...component.props,
          label,
        },
      })
    }

    const handleVariantChange = (variant: ButtonVariant) => {
      onChangeComponent({
        ...component,
        props: {
          ...component.props,
          variant,
        },
      })
    }

    const handleDisabledChange = (disabled: boolean) => {
      onChangeComponent({
        ...component,
        props: {
          ...component.props,
          disabled,
        },
      })
    }

    return (
      <aside className="inspector-pane">
        <h2>Inspector</h2>
        <TextField label="label" value={component.props.label} onChange={handleLabelChange} />
        <SelectField
          label="variant"
          value={component.props.variant}
          options={buttonVariantOptions}
          onChange={handleVariantChange}
        />
        <CheckboxField
          label="disabled"
          checked={component.props.disabled}
          onChange={handleDisabledChange}
        />
      </aside>
    )
  }

  if (component.type === 'Card') {
    const handleTitleChange = (title: string) => {
      onChangeComponent({
        ...component,
        props: {
          ...component.props,
          title,
        },
      })
    }

    const handleDescriptionChange = (description: string) => {
      onChangeComponent({
        ...component,
        props: {
          ...component.props,
          description,
        },
      })
    }

    return (
      <aside className="inspector-pane">
        <h2>Inspector</h2>
        <TextField label="title" value={component.props.title} onChange={handleTitleChange} />
        <TextField
          label="description"
          value={component.props.description}
          onChange={handleDescriptionChange}
        />
      </aside>
    )
  }

  const handlePlaceholderChange = (placeholder: string) => {
    onChangeComponent({
      ...component,
      props: {
        ...component.props,
        placeholder,
      },
    })
  }

  const handleDisabledChange = (disabled: boolean) => {
    onChangeComponent({
      ...component,
      props: {
        ...component.props,
        disabled,
      },
    })
  }

  return (
    <aside className="inspector-pane">
      <h2>Inspector</h2>
      <TextField
        label="placeholder"
        value={component.props.placeholder}
        onChange={handlePlaceholderChange}
      />
      <CheckboxField
        label="disabled"
        checked={component.props.disabled}
        onChange={handleDisabledChange}
      />
    </aside>
  )
}

export default InspectorPane
