type ButtonPreviewProps = {
  label: string
  variant: 'primary' | 'secondary'
  disabled: boolean
}

const ButtonPreview = ({ label, variant, disabled }: ButtonPreviewProps) => {
  return (
    <button className={`preview-button preview-button-${variant}`} disabled={disabled} type="button">
      {label}
    </button>
  )
}

export default ButtonPreview
