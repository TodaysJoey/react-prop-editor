import type { ComponentType as ReactComponentType } from 'react'
import ButtonPreview from '../components/previews/ButtonPreview'
import CardPreview from '../components/previews/CardPreview'
import InputPreview from '../components/previews/InputPreview'
import type { EditorNode } from '../types/editor'

type ComponentRegistry = {
  [Type in EditorNode['type']]: {
    label: string
    preview: ReactComponentType<Extract<EditorNode, { type: Type }>['props']>
    defaultProps: Extract<EditorNode, { type: Type }>['props']
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
  },
  Card: {
    label: 'Card',
    preview: CardPreview,
    defaultProps: {
      title: 'Card Title',
      description: 'Card description',
    },
  },
  Input: {
    label: 'Input',
    preview: InputPreview,
    defaultProps: {
      placeholder: 'Type here',
      disabled: false,
    },
  },
} satisfies ComponentRegistry
