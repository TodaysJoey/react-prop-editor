export type ComponentType = 'Button' | 'Card' | 'Input'

export type ButtonProps = {
  label: string
  variant: 'primary' | 'secondary'
  disabled: boolean
}

export type CardProps = {
  title: string
  description: string
}

export type InputProps = {
  placeholder: string
  disabled: boolean
}

export type ComponentPropsMap = {
  Button: ButtonProps
  Card: CardProps
  Input: InputProps
}

export type ComponentProps<Type extends ComponentType = ComponentType> = ComponentPropsMap[Type]

export type EditorNode<Type extends ComponentType = ComponentType> = {
  [Key in ComponentType]: {
    id: string
    type: Key
    props: ComponentPropsMap[Key]
  }
}[Type]

export type EditorState = {
  nodes: EditorNode[]
  selectedNodeId: string
}
