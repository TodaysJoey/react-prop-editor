type InputPreviewProps = {
  placeholder: string
  disabled: boolean
}

const InputPreview = ({ placeholder, disabled }: InputPreviewProps) => {
  return <input className="preview-input" disabled={disabled} placeholder={placeholder} />
}

export default InputPreview
