function Field({ label, ...inputProps }) {
  return <label className="field"><span>{label}</span><input {...inputProps} /></label>
}

export default Field