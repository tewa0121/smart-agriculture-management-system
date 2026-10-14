import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Footer from "../../components/common/Footer";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    // Validate full name.
    if (!form.full_name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    // Validate Gmail address.
    const emailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
    const email = form.email.trim().toLowerCase();

    if (!emailPattern.test(email)) {
      setError("Please enter a valid Gmail address ending with @gmail.com.");
      return;
    }

    // Validate phone number.
    const phoneDigits = form.phone.replace(/\D/g, "");

    if (phoneDigits.length < 10) {
      setError("Phone number must contain at least 10 digits.");
      return;
    }

    // Validate password.
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    // Confirm password.
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      // Backend expects "name", not "full_name".
      const response = await api.post("/auth/register", {
        name: form.full_name.trim(),
        email,
        phone: form.phone.trim(),
        password: form.password,
      });

      setSuccess(
        response.data?.message ||
          "Registration successful! Redirecting to login..."
      );

      setForm({
        full_name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);
    } catch (err) {
      console.error(
        "Registration error:",
        err.response?.data || err
      );

      const responseData = err.response?.data;

      if (Array.isArray(responseData?.errors)) {
        const messages = responseData.errors
          .map((item) => {
            if (typeof item === "string") {
              return item;
            }

            return item.msg || item.message || JSON.stringify(item);
          })
          .join(", ");

        setError(messages || "Please check your registration details.");
      } else if (typeof responseData?.errors === "string") {
        setError(responseData.errors);
      } else {
        setError(
          responseData?.message ||
            responseData?.error ||
            "Registration failed. Please check your information and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f3f6f4",
      }}
    >
      <main
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "35px 16px",
        }}
      >
        <div
          className="card border-0 shadow-lg rounded-4"
          style={{
            width: "100%",
            maxWidth: "540px",
          }}
        >
          <div className="card-body p-4 p-md-5">
            {/* Logo and title */}
            <div className="text-center mb-4">
              <div
                className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{
                  width: "64px",
                  height: "64px",
                  fontSize: "28px",
                }}
              >
                🌱
              </div>

              <h2 className="fw-bold mb-1">
                Smart Agriculture
              </h2>

              <p className="text-muted mb-0">
                Management System
              </p>
            </div>

            {/* Welcome message */}
            <div className="mb-4">
              <h4 className="fw-semibold">
                Create Account
              </h4>

              <p className="text-muted">
                Register to manage your agricultural activities.
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="alert alert-success" role="alert">
                {success}
              </div>
            )}

            {/* Registration form */}
            <form onSubmit={handleSubmit}>
              {/* Full name */}
              <div className="mb-3">
                <label
                  htmlFor="full_name"
                  className="form-label fw-semibold"
                >
                  Full name
                </label>

                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  className="form-control form-control-lg"
                  placeholder="Enter your full name"
                  value={form.full_name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </div>

              {/* Email */}
              <div className="mb-3">
                <label
                  htmlFor="email"
                  className="form-label fw-semibold"
                >
                  Gmail address
                </label>

                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control form-control-lg"
                  placeholder="example@gmail.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />

                <small className="text-muted">
                  Please use an email address ending with @gmail.com.
                </small>
              </div>

              {/* Phone */}
              <div className="mb-3">
                <label
                  htmlFor="phone"
                  className="form-label fw-semibold"
                >
                  Phone number
                </label>

                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="form-control form-control-lg"
                  placeholder="Enter your phone number"
                  value={form.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                  required
                />

                <small className="text-muted">
                  Enter at least 10 digits.
                </small>
              </div>

              {/* Password */}
              <div className="mb-3">
                <label
                  htmlFor="password"
                  className="form-label fw-semibold"
                >
                  Password
                </label>

                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-control form-control-lg"
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>

              {/* Confirm password */}
              <div className="mb-4">
                <label
                  htmlFor="confirmPassword"
                  className="form-label fw-semibold"
                >
                  Confirm password
                </label>

                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="form-control form-control-lg"
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="btn btn-success btn-lg w-100"
                disabled={loading}
              >
                {loading
                  ? "Creating account..."
                  : "Create Account"}
              </button>
            </form>

            {/* Login link */}
            <div className="text-center mt-4">
              <span className="text-muted">
                Already have an account?{" "}
              </span>

              <Link
                to="/login"
                className="text-success fw-semibold text-decoration-none"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Shared footer */}
      <Footer />
    </div>
  );
}

export default Register;