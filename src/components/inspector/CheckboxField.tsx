type CheckboxFieldProps = {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

const CheckboxField = ({ label, checked, onChange }: CheckboxFieldProps) => {
  return (
    <label className="inspector-checkbox">
      <input checked={checked} onChange={(event) => onChange(event.target.checked)} type="checkbox" />
      <span>{label}</span>
    </label>
  )
}

export default CheckboxField
