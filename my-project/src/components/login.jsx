import React, { useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setToken, setUser } from "../redux/userSlice"; 
import { useNavigate } from "react-router-dom";

export default function Signin() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
    const [r, setr] = useState(true);

     const dispatch = useDispatch();
const navigate = useNavigate();


  const [form, setForm] = useState({
    email: "",
    otp: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateStep1 = () => {
    if (!form.email.trim()) {
      toast.error("Email is required");
      return false;
    }
    return true;
  };

  const handleGetOtp1 = async () => {
    if (!validateStep1()) return;
   
    setr(false);
    try {
      const res = await axios.post("http://localhost:5000/auth/login", {
        email: form.email,
      });
      toast.success("OTP sent to your email!");
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data.message || "Failed to send OTP.");
      console.error("Error:", error.response?.data || error.message);
    } finally {
   
      setr(true)
    }
  };

  const handleGetOtp = async () => {
    if (!validateStep1()) return;
    setLoading(true);
    setr(false);
    try {
      const res = await axios.post("http://localhost:5000/auth/login", {
        email: form.email,
      });
      toast.success("OTP sent to your email!");
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data.message || "Failed to send OTP.");
      console.error("Error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
      setr(true)
    }
  };

  const handleSignin = async (e) => {
    e.preventDefault();
    if (!form.otp.trim()) {
      toast.error("OTP is required");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/auth/verify-login", {
        email: form.email,
        otp: form.otp,
        keepLoggedIn,
      });
      const user = res.data.user;
       const token=res.data.token;
          dispatch(setUser(user));
          dispatch(setToken(token)) 

      toast.success("Signin successful!");
      navigate("/profile")
    } catch (error) {
      toast.error("Invalid OTP or email.");
      console.error("Signin failed:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Left: Form */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 px-6 py-8">
        <div className="w-full max-w-md border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-center items-center gap-3 mb-6">
            <img src="/icon.png" alt="HD Logo" className="w-9 h-9" />
            <h1 className="text-xl font-semibold text-gray-900">HD</h1>
          </div>

          <h2 className="text-3xl font-bold text-center text-black mb-2">Sign in</h2>
          <p className="text-gray-500 text-center mb-6">
            {step === 1
              ? "Enter your email to receive an OTP"
              : "Enter the OTP sent to your email"}
          </p>

          <form className="space-y-4" onSubmit={handleSignin}>
            {step === 1 ? (
              <>
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="jonas_kahnwald@gmail.com"
                    className="w-full border-2 border-blue-400 rounded-xl px-4 py-2 mt-1 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleGetOtp}
                  className="w-full bg-blue-500 text-white font-semibold py-2 rounded-xl hover:bg-blue-600 transition"
                  disabled={loading}
                >
                  {loading ? "Sending OTP..." : "Get OTP"}
                </button>
              </>
            ) : (
              <>
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    disabled
                    className="w-full border bg-gray-100 rounded-xl px-4 py-2 mt-1 outline-none cursor-not-allowed"
                  />
                </div>

                <div className="relative">
                  <label className="text-sm text-gray-500">Enter OTP</label>
                  <input
                    type={showOtp ? "text" : "password"}
                    name="otp"
                    value={form.otp}
                    onChange={handleChange}
                    placeholder="Enter OTP"
                    className="w-full border rounded-xl px-4 py-2 mt-1 outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOtp(!showOtp)}
                    className="absolute top-9 right-3"
                  >
                    <img
                     src={showOtp ? "/eye-open.png":"/eye-off.png"}
                      alt="Toggle OTP visibility"
                      className="w-5 h-5"
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <label className="flex items-center text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={keepLoggedIn}
                      onChange={(e) => setKeepLoggedIn(e.target.checked)}
                      className="mr-2"
                    />
                    Keep me signed in
                  </label>

                  <button
                    type="button"
                    onClick={handleGetOtp1}
                    disabled={loading}
                    className="text-sm text-blue-500 font-medium hover:underline"
                  >
                    {r? "Resend OTP ":" Resending OTP...."}
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white font-semibold py-2 rounded-xl hover:bg-blue-600 transition"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </>
            )}
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Need an account?{" "}
            <a href="/signup" className="text-blue-500 font-medium underline">
              Create one
            </a>
          </p>
        </div>
      </div>

      {/* Right: Image */}
      <div className="hidden md:flex md:w-1/2 items-center justify-center bg-blue-50">
        <img
          src="/poster.jpg"
          alt="Signin illustration"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
