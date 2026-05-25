import type { ComponentType } from 'react'
import ButtonPreview from '../components/previews/ButtonPreview'
import CardPreview from '../components/previews/CardPreview'
import InputPreview from '../components/previews/InputPreview'
import type { ComponentItem } from '../types/component'

type ComponentRegistry = {
  [Type in ComponentItem['type']]: {
    preview: ComponentType<Extract<ComponentItem, { type: Type }>['props']>
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
