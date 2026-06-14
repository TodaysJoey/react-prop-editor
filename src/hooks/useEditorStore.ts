import { create } from 'zustand'
import { componentRegistry } from '../registry/componentRegistry'
import type { EditorNode } from '../types/editor'

interface EditorStore {
  components: EditorNode[]
  selectedComponentId: string
  setSelectedComponentId: (id: string) => void
  updateComponent: (nextComponent: EditorNode) => void
  importState: (components: EditorNode[], selectedComponentId: string) => void
}

export const useEditorStore = create<EditorStore>((set) => ({
  components: [
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
  ] as EditorNode[],
  selectedComponentId: 'btn-1',
  setSelectedComponentId: (id) => set({ selectedComponentId: id }),
  updateComponent: (nextComponent) =>
    set((state) => ({
      components: state.components.map((component) =>
        component.id === nextComponent.id ? nextComponent : component,
      ),
    })),
  importState: (components, selectedComponentId) => set({ components, selectedComponentId }),
}))
