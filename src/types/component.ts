export type ComponentItem =
  | {
      id: string
      type: 'Button'
      props: {
        label: string
        variant: 'primary' | 'secondary'
        disabled: boolean
      }
    }
  | {
      id: string
      type: 'Card'
      props: {
        title: string
        description: string
      }
    }
  | {
      id: string
      type: 'Input'
      props: {
        placeholder: string
        disabled: boolean
      }
    }
