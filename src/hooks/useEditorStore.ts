import { create } from 'zustand'
import { componentRegistry } from '../registry/componentRegistry'
import type { EditorNode } from '../types/editor'

interface EditorPresent {
  components: EditorNode[]
  selectedComponentId: string
}

interface EditorStore {
  past: EditorPresent[]
  present: EditorPresent
  future: EditorPresent[]
  setSelectedComponentId: (id: string) => void
  updateComponent: (nextComponent: EditorNode) => void
  importState: (components: EditorNode[], selectedComponentId: string) => void
  undo: () => void
  redo: () => void
}

const initialPresent: EditorPresent = {
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
}

const pushHistory = (state: EditorStore, present: EditorPresent) => ({
  past: [...state.past, state.present],
  present,
  future: [],
})

export const useEditorStore = create<EditorStore>((set) => ({
  past: [],
  present: initialPresent,
  future: [],
  setSelectedComponentId: (id) =>
    set((state) => ({
      present: {
        ...state.present,
        selectedComponentId: id,
      },
    })),
  updateComponent: (nextComponent) =>
    set((state) => {
      const componentExists = state.present.components.some(
        (component) => component.id === nextComponent.id,
      )

      if (!componentExists) {
        return state
      }

      return pushHistory(state, {
        ...state.present,
        components: state.present.components.map((component) =>
          component.id === nextComponent.id ? nextComponent : component,
        ),
      })
    }),
  importState: (components, selectedComponentId) =>
    set((state) =>
      pushHistory(state, {
        components,
        selectedComponentId,
      }),
    ),
  undo: () =>
    set((state) => {
      if (state.past.length === 0) {
        return state
      }

      const previous = state.past[state.past.length - 1]

      return {
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future],
      }
    }),
  redo: () =>
    set((state) => {
      if (state.future.length === 0) {
        return state
      }

      const next = state.future[0]

      return {
        past: [...state.past, state.present],
        present: next,
        future: state.future.slice(1),
      }
    }),
}))
