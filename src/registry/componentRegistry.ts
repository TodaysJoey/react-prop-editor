import type { ComponentType as ReactComponentType } from 'react'
import ButtonPreview from '../components/previews/ButtonPreview'
import CardPreview from '../components/previews/CardPreview'
import InputPreview from '../components/previews/InputPreview'
import type { EditorNode } from '../types/editor'

type PropSchemaField<Value> = [Value] extends [boolean]
  ? {
      type: 'boolean'
      label: string
    }
  : [Value] extends [string]
    ?
        | {
            type: 'text'
            label: string
          }
        | {
            type: 'select'
            label: string
            options: readonly Value[]
          }
    : never

type PropsSchema<Props> = {
  [Key in keyof Props]: PropSchemaField<Props[Key]>
}

type ComponentRegistry = {
  [Type in EditorNode['type']]: {
    label: string
    preview: ReactComponentType<Extract<EditorNode, { type: Type }>['props']>
    defaultProps: Extract<EditorNode, { type: Type }>['props']
    propsSchema: PropsSchema<Extract<EditorNode, { type: Type }>['props']>
  }
}

export const componentRegistry = {
  Button: {
    label: 'Button',
    preview: ButtonPreview,
    defaultProps: {
      label: 'Save',
      variant: 'primary',
      disabled: false,
    },
    propsSchema: {
      label: {
        type: 'text',
        label: 'Label',
      },
      variant: {
        type: 'select',
        label: 'Variant',
        options: ['primary', 'secondary'],
      },
      disabled: {
        type: 'boolean',
        label: 'Disabled',
      },
    },
  },
  Card: {
    label: 'Card',
    preview: CardPreview,
    defaultProps: {
      title: 'Card Title',
      description: 'Card description',
    },
    propsSchema: {
      title: {
        type: 'text',
        label: 'Title',
      },
      description: {
        type: 'text',
        label: 'Description',
      },
    },
  },
  Input: {
    label: 'Input',
    preview: InputPreview,
    defaultProps: {
      placeholder: 'Type here',
      disabled: false,
    },
    propsSchema: {
      placeholder: {
        type: 'text',
        label: 'Placeholder',
      },
      disabled: {
        type: 'boolean',
        label: 'Disabled',
      },
    },
  },
} satisfies ComponentRegistry
