import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();

    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      await API.post("/auth/register", {
        name,
        email,
        password,
      });

      alert("Registered successfully. Check your email for the verification code.");
      localStorage.setItem("verifyEmail", email);
      navigate("/verify");
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Registration failed"
      );
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">

      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg">

        {/* Heading */}
        <h1 className="text-3xl font-bold text-slate-800 text-center">
          Create Account
        </h1>

        <p className="text-slate-500 text-center mt-2 mb-8">
          Start managing your tasks better
        </p>

        {/* Form */}
        <form onSubmit={handleRegister}>

          {/* Name */}
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Name
          </label>

          <input
            type="text"
            placeholder="Enter name"
            className="w-full border border-slate-300 rounded-xl px-4 py-3 mb-5 outline-none focus:border-blue-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Email */}
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

          {/* Password */}
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
              onClick={() =>
                setShowPassword(!showPassword)
              }
            >
              {showPassword ? "Hide" : "Show"}
            </button>

          </div>

          {/* Register Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700"
          >
            Register
          </button>

        </form>

        {/* Login Link */}
        <p className="text-center text-slate-500 mt-6">
          Already have an account?{" "}

          <Link
            to="/"
            className="text-blue-600 font-semibold"
          >
            Login
          </Link>

        </p>

      </div>
    </div>
  );
}

export default Register;