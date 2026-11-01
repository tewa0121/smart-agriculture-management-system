import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

// Password field with a show/hide eye button.
// Accepts the same props as a normal <input> (id, name, value, onChange...).
function PasswordInput({ size, className = "", ...inputProps }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={`input-group ${size === "lg" ? "input-group-lg" : ""}`}>
      <input
        {...inputProps}
        type={visible ? "text" : "password"}
        className={`form-control ${className}`}
      />

      <button
        type="button"
        className="btn btn-outline-secondary"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Hide password" : "Show password"}
        title={visible ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        {visible ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
  );
}

export default PasswordInput;
