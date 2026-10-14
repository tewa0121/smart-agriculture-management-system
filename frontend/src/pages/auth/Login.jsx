import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Footer from "../../components/common/Footer";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", formData);

      const { token, user } = response.data.data;

      login(token, user);

      if (user.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else if (user.role === "farmer") {
        navigate("/farmer/dashboard", { replace: true });
      } else {
        setError("Your account has an unrecognized role.");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to login. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="bg-light"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <main
        className="container py-5"
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="row justify-content-center w-100">
          <div className="col-12 col-md-8 col-lg-5">
            <div className="card border-0 shadow-lg rounded-4">
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
                    Welcome back
                  </h4>

                  <p className="text-muted mb-0">
                    Sign in to manage your agricultural activities.
                  </p>
                </div>

                {/* Error message */}
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                {/* Login form */}
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label
                      htmlFor="email"
                      className="form-label fw-semibold"
                    >
                      Email address
                    </label>

                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-control form-control-lg"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div className="mb-4">
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
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      autoComplete="current-password"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-success btn-lg w-100"
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </button>
                </form>

                {/* Registration link */}
                <div className="text-center mt-4">
                  <span className="text-muted">
                    Don't have an account?{" "}
                  </span>

                  <Link
                    to="/register"
                    className="text-success fw-semibold text-decoration-none"
                  >
                    Register
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Login;