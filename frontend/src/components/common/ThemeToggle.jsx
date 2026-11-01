import { FaMoon, FaSun } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`btn btn-sm rounded-pill px-3 py-2 d-flex align-items-center gap-2 ${
        isDark ? "btn-warning text-dark" : "btn-dark text-white"
      } ${className}`}
      title="Toggle theme"
      aria-label="Toggle theme"
    >
      {isDark ? <FaSun /> : <FaMoon />}
      <span className="d-none d-sm-inline">
        {isDark ? "Sunny Mode" : "Dark Mode"}
      </span>
    </button>
  );
}

export default ThemeToggle;
