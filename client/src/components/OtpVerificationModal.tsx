import React, { useState, useEffect } from "react";
import { FiMail, FiCheck, FiRefreshCw, FiArrowLeft } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../stores/store";
import { verifyOtp, resendOtp, clearError } from "../stores/slices/AuthSlice";

type OtpModalProps = {
  email: string;
  onBack: () => void;
  previewUrl?: string | null;
};

const OtpVerificationModal: React.FC<OtpModalProps> = ({ email, onBack, previewUrl }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, message } = useSelector(
    (state: RootState) => state.auth
  );

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [localError, setLocalError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Paste handling
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setOtp(newOtp);
      const nextFocus = Math.min(digits.length, 5);
      document.getElementById(`otp-input-${nextFocus}`)?.focus();
      return;
    }

    const cleanDigit = value.replace(/\D/g, "");
    const newOtp = [...otp];
    newOtp[index] = cleanDigit;
    setOtp(newOtp);
    setLocalError(null);
    if (error) dispatch(clearError());

    // Auto-focus next field
    if (cleanDigit && index < 5) {
      document.getElementById(`otp-input-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`)?.focus();
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const fullOtp = otp.join("").trim();
    if (fullOtp.length !== 6) {
      setLocalError("Please enter all 6 digits of your verification code.");
      return;
    }

    try {
      await dispatch(verifyOtp({ email, otp: fullOtp })).unwrap();
      // Use window.location.href to guarantee complete clean session & state load on dashboard
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("OTP verification error:", err);
      setLocalError(typeof err === "string" ? err : "Verification failed. Please check the code.");
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLocalError(null);
    setResendSuccess(null);

    try {
      const res = await dispatch(resendOtp(email)).unwrap();
      setResendSuccess(res?.message || "New verification code sent!");
      setResendCooldown(60);
      setOtp(["", "", "", "", "", ""]);
      document.getElementById("otp-input-0")?.focus();
    } catch (err) {
      setLocalError(typeof err === "string" ? err : "Failed to resend code.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-6">
        {/* Header Icon */}
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-sm">
            <FiMail />
          </div>
          <h3 className="text-2xl font-bold font-serif text-gray-900 mt-4">
            Verify Your Email
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
            We've sent a 6-digit confirmation code to:
            <br />
            <strong className="text-gray-900 font-semibold">{email}</strong>
          </p>
        </div>

        {/* Development preview link if available */}
        {previewUrl && (
          <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-xl text-center">
            <p className="text-xs text-blue-700 font-medium">
              Ethereal Test Mail Preview:{" "}
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="underline font-bold text-blue-900 hover:text-blue-950"
              >
                View Email Inbox ↗
              </a>
            </p>
          </div>
        )}

        {/* Feedback Messages */}
        {localError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm p-3 rounded-xl text-center font-medium animate-fadeIn">
            {localError}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm p-3 rounded-xl text-center font-medium animate-fadeIn">
            {error}
          </div>
        )}
        {resendSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm p-3 rounded-xl text-center font-medium flex items-center justify-center gap-1.5 animate-fadeIn">
            <FiCheck className="text-emerald-600" />
            <span>{resendSuccess}</span>
          </div>
        )}
        {message && !resendSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm p-3 rounded-xl text-center font-medium animate-fadeIn">
            {message}
          </div>
        )}

        {/* OTP Input Form */}
        <form onSubmit={handleVerifySubmit} className="space-y-6">
          <div className="flex justify-center gap-2 sm:gap-2.5">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-input-${idx}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold bg-gray-50 border-2 border-gray-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition hover-lift disabled:opacity-50 cursor-pointer text-sm"
          >
            {loading ? "Verifying & Logging In..." : "Verify & Complete Signup"}
          </button>
        </form>

        {/* Resend and Back actions */}
        <div className="space-y-3 pt-2 text-center border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Didn't receive the email?{" "}
            {resendCooldown > 0 ? (
              <span className="font-semibold text-gray-700">
                Resend in {resendCooldown}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer inline-flex items-center gap-1"
              >
                <FiRefreshCw className="text-xs" /> Resend Code
              </button>
            )}
          </p>

          <button
            type="button"
            onClick={onBack}
            className="text-xs text-gray-400 hover:text-gray-700 transition flex items-center justify-center gap-1 mx-auto cursor-pointer font-medium"
          >
            <FiArrowLeft /> Back to Signup Form
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpVerificationModal;
