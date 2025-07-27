import React, { useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUser,setToken } from "../redux/userSlice"; // path to userSlice


import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [otpStep, setOtpStep] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false); // 👁️ OTP toggle state

  const dispatch = useDispatch();
const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    dob: "",
    otp: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateInputs = () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return false;
    }
    if (!form.dob) {
      toast.error("Date of birth is required");
      return false;
    }
    if (!form.email.trim()) {
      toast.error("Email is required");
      return false;
    }
    return true;
  };

  const handleGetOtp = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/auth/signup", {
        name: form.name,
        email: form.email,
        dateOfBirth: form.dob,
      });
      toast.success("OTP sent to your email!");
      setOtpStep(true);
    } catch (error) {
      toast.error(error.response?.data.message || "Failed to send OTP.");
      console.error("Error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!form.otp.trim()) {
      toast.error("OTP is required");
      return;
    }

    setLoading(true);
    try {
      const res=await axios.post("http://localhost:5000/auth/verify-signup", {
        email: form.email,
        otp: form.otp,
      }).catch(err=>console.log("error in otp verification"));

      const user = res.data.user;
      const token=res.data.token;
    dispatch(setUser(user)); //
      dispatch(setToken(token))
  
      toast.success("Signup successful!");
      navigate("/profile");  
    } catch (error) {
      toast.error("Invalid OTP or email.");
      console.error("Signup failed:", error.response?.data || error.message);
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

          <h2 className="text-3xl font-bold text-center text-black mb-2">Sign up</h2>
          <p className="text-gray-500 text-center mb-6">
            {otpStep ? "Enter the OTP sent to your email" : "Sign up to enjoy the feature of HD"}
          </p>

          <form className="space-y-4" onSubmit={otpStep ? handleSignup : (e) => e.preventDefault()}>
            <div>
              <label className="text-sm text-gray-500">Your Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Jonas Kahnwald"
                className="w-full border rounded-xl px-4 py-2 mt-1 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm text-gray-500">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={form.dob}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-2 mt-1 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

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

            {otpStep && (
              <div>
                <label className="text-sm text-gray-500">Enter OTP</label>
                <div className="relative">
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
  className="absolute top-2 mt-1 right-3"
>
  <img
    src={showOtp ? "/eye-open.png":"/eye-off.png"}
    alt={showOtp ? "Hide OTP" : "Show OTP"}
    className="w-5 h-5"
  />
</button>
                </div>
              </div>
            )}

            {!otpStep ? (
              <button
                type="button"
                onClick={handleGetOtp}
                className="w-full bg-blue-500 text-white font-semibold py-2 rounded-xl hover:bg-blue-600 transition"
                disabled={loading}
              >
                {loading ? "Sending OTP..." : "Get OTP"}
              </button>
            ) : (
              <button
                type="submit"
                className="w-full bg-blue-500 text-white font-semibold py-2 rounded-xl hover:bg-blue-600 transition"
                disabled={loading}
              >
                {loading ? "Signing up..." : "Sign up"}
              </button>
            )}
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <a href="/signin" className="text-blue-500 font-medium underline">
              Sign in
            </a>
          </p>
        </div>
      </div>

      {/* Right: Image */}
      <div className="hidden md:flex md:w-1/2 items-center justify-center bg-blue-50">
        <img src="/poster.jpg" alt="Signup illustration" className="w-full h-full object-cover" />
      </div>
    </div>
  );
}
