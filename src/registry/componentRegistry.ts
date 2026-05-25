import type { ComponentType as ReactComponentType } from 'react'
import ButtonPreview from '../components/previews/ButtonPreview'
import CardPreview from '../components/previews/CardPreview'
import InputPreview from '../components/previews/InputPreview'
import type { EditorNode } from '../types/editor'

type ComponentRegistry = {
  [Type in EditorNode['type']]: {
    preview: ReactComponentType<Extract<EditorNode, { type: Type }>['props']>
  }
}

export const componentRegistry = {
  Button: {
    preview: ButtonPreview,
  },
  Card: {
    preview: CardPreview,
  },
  Input: {
    preview: InputPreview,
  },
} satisfies ComponentRegistry
