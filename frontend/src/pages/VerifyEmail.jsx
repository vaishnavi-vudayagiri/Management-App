import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";

function VerifyEmail() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");

    useEffect(() => {
        const savedEmail = localStorage.getItem("verifyEmail");
        if (savedEmail) {
            setEmail(savedEmail);
        }
    }, []);

    async function handleVerify(e) {
        e.preventDefault();

        if (!email || !code) {
            alert("Please enter your email and verification code.");
            return;
        }

        try {
            await API.post("/auth/verify-email", {
                email,
                code,
            });

            alert("Email verified successfully. You may now log in.");
            localStorage.removeItem("verifyEmail");
            navigate("/login");
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Verification failed. Please try again."
            );
        }
    }

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
            <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg">
                <h1 className="text-3xl font-bold text-slate-800 text-center">
                    Verify Email
                </h1>
                <p className="text-slate-500 text-center mt-2 mb-8">
                    Enter the code sent to your email to complete registration.
                </p>

                <form onSubmit={handleVerify}>
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
                        Verification Code
                    </label>
                    <input
                        type="text"
                        placeholder="Enter verification code"
                        className="w-full border border-slate-300 rounded-xl px-4 py-3 mb-6 outline-none focus:border-blue-500"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                    />

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700"
                    >
                        Verify Email
                    </button>
                </form>

                <p className="text-center text-slate-500 mt-6">
                    Already verified?{" "}
                    <Link to="/login" className="text-blue-600 font-semibold">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default VerifyEmail;
