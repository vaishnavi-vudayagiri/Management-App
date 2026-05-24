import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-slate-800 text-center">
          Welcome Back
        </h1>

        <p className="text-slate-500 text-center mt-2 mb-8">
          Login to continue your workspace
        </p>

        <form onSubmit={handleLogin}>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Email
          </label>
          <input
            type="email"
            placeholder="Enter email"
            className="w-full border border-slate-300 rounded-xl px-4 py-3 mb-5 outline-none focus:border-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Password
          </label>

          <div className="relative mb-6">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              className="w-full border border-slate-300 rounded-xl px-4 py-3 pr-20 outline-none focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600 text-sm font-semibold"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700"
          >
            Login
          </button>
        </form>

        <p className="text-center text-slate-500 mt-6">
          New user?{" "}
          <Link to="/register" className="text-blue-600 font-semibold">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;