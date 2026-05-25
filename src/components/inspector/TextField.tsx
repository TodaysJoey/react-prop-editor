type TextFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
}

const TextField = ({ label, value, onChange }: TextFieldProps) => {
  return (
    <label className="inspector-field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

export default TextField
