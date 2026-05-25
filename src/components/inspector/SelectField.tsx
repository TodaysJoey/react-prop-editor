type SelectFieldProps<TValue extends string> = {
  label: string
  value: TValue
  options: readonly TValue[]
  onChange: (value: TValue) => void
}

const SelectField = <TValue extends string>({
  label,
  value,
  options,
  onChange,
}: SelectFieldProps<TValue>) => {
  return (
    <label className="inspector-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as TValue)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

export default SelectField
