"use client";

import React, { useState} from "react";
import { useRouter } from "next/navigation";
import { sendOtpRequest, verifyOtpRequest } from "@/utils/api"; // adjust path

export default function LoginScreen() {
  const router = useRouter();

  // useEffect(() => {
  //   const token = localStorage.getItem("access_token");
  //   if (token) {
  //     router.push("/Dashboard");
  //   }
  // }, [router]);

  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [error, setError] = useState("");

  // ✅ Request OTP
  const handleSendOtp = async () => {
    setError("");
    const success = await sendOtpRequest(mobileNumber, setError);
    if (success) {
      setStep("otp");
    }
  };

  // ✅ Verify OTP
  const handleVerifyOtp = async () => {
    setError("");
    const success = await verifyOtpRequest(mobileNumber, otp, setError);
    if (success) {
      router.push("/Dashboard"); // redirect after login
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-sm">
        <h1 className="text-xl font-bold text-center mb-4">Login with OTP</h1>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-600 text-sm p-2 rounded mb-3">
            {error}
          </div>
        )}

        {step === "phone" ? (
          <>
            <input
              type="tel"
              placeholder="Enter mobile number"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="w-full border rounded-lg p-2 mb-4"
            />
            <button
              onClick={handleSendOtp}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Send OTP
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border rounded-lg p-2 mb-4"
            />
            <button
              onClick={handleVerifyOtp}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
            >
              Verify OTP
            </button>
            <button
              onClick={() => setStep("phone")}
              className="w-full text-blue-500 mt-2 text-sm"
            >
              Change Number
            </button>
          </>
        )}
      </div>
    </div>
  );
}
