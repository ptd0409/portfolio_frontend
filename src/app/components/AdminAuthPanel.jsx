import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function AdminAuthPanel() {
  const { login, register, forgotPassword, resetPassword } = useAuth();
  const [searchParams] = useSearchParams();

  const resetToken = searchParams.get("token") || "";

  const initialMode = useMemo(() => {
    return resetToken ? "reset" : "login";
  }, [resetToken]);

  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const titleMap = {
    login: "Admin Login",
    register: "Create Admin Account",
    forgot: "Forgot Password",
    reset: "Reset Password",
  };

  const subtitleMap = {
    login: "Sign in to manage your portfolio projects and uploads.",
    register: "Create your admin account to access the dashboard.",
    forgot: "Enter your email and we’ll send you a reset link.",
    reset: "Enter your new password to continue.",
  };

  const clearForm = () => {
    setEmail("");
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage("");
  };

  const switchMode = (nextMode) => {
    clearForm();
    setMode(nextMode);
  };

  const getErrorMessage = (err, currentMode) => {
    const raw =
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      err?.message ||
      "";

    const normalized = String(raw).toLowerCase();

    if (currentMode === "login") {
      if (
        normalized.includes("user not found") ||
        normalized.includes("account not found") ||
        normalized.includes("admin not found") ||
        normalized.includes("not registered") ||
        normalized.includes("does not exist")
      ) {
        return "Account is not created!";
      }

      if (
        normalized.includes("invalid credentials") ||
        normalized.includes("incorrect password") ||
        normalized.includes("wrong password") ||
        normalized.includes("login failed")
      ) {
        return "Email or password is incorrect!";
      }

      if (normalized.includes("not verified")) {
        return "Account is not verified!";
      }

      return "Login failed!";
    }

    if (currentMode === "register") {
      if (
        normalized.includes("already exists") ||
        normalized.includes("already registered") ||
        normalized.includes("email already")
      ) {
        return "Email existed!";
      }
      return "Register failed!";
    }

    if (currentMode === "forgot") {
      return "Cannot send email to reset your password!";
    }

    if (currentMode === "reset") {
      return "Cannot reset your password!";
    }

    return "Something went wrong!";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login({ email, password });
        setMessage("Login successfully!");
        setPassword("");
      } else if (mode === "register") {
        if (password !== confirmPassword) {
          throw new Error("Password confirmation does not match");
        }

        const res = await register({ email, password });
        setMessage(
          res.message ||
            "Register successfully! Please check your email to verify."
        );

        clearForm();
        setMode("login");
      } else if (mode === "forgot") {
        const res = await forgotPassword(email);
        setMessage(
          res.message ||
            "If email existed, the link to reset your password was sent."
        );
        setEmail("");
      } else if (mode === "reset") {
        const res = await resetPassword({
          token: resetToken,
          newPassword,
        });
        setMessage(res.message || "Reset password successfully!");
        setNewPassword("");
        setMode("login");
      }
    } catch (err) {
      if (
        mode === "register" &&
        err?.message === "Password confirmation does not match"
      ) {
        setMessage("Password confirmation does not match!");
      } else {
        setMessage(getErrorMessage(err, mode));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-10 items-center">
        <div className="hidden lg:flex flex-col justify-center">
          <div className="bg-[#d4c896] rounded-3xl p-10 border-2 border-[#00003d] shadow-lg">
            <div className="w-20 h-20 rounded-2xl bg-white border-2 border-[#00003d] flex items-center justify-center mb-6">
              <ShieldCheck className="w-10 h-10 text-[#00003d]" />
            </div>

            <h2 className="text-5xl font-bold text-[#00003d] leading-tight mb-4">
              Secure admin access
              <br />
              for your portfolio
            </h2>

            <p className="text-[#00003d]/80 text-lg leading-relaxed max-w-xl">
              Manage projects, upload cover images, write rich content, and keep
              everything protected with JWT authentication and email-based
              password recovery.
            </p>
          </div>
        </div>

        <div className="w-full max-w-xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 md:p-10">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-[#00003d] mb-3">
                {titleMap[mode]}
              </h1>
              <p className="text-gray-600 leading-relaxed">
                {subtitleMap[mode]}
              </p>
            </div>

            {message && (
              <div className="mb-6 px-4 py-3 rounded-xl border border-[#d4c896] bg-[#f5f3e8] text-[#00003d]">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {(mode === "login" ||
                mode === "register" ||
                mode === "forgot") && (
                <div>
                  <label className="block text-[#00003d] font-semibold mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Enter your email"
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4c896] focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {(mode === "login" || mode === "register") && (
                <div>
                  <label className="block text-[#00003d] font-semibold mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <LockKeyhole className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      minLength={8}
                      maxLength={72}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter your password"
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4c896] focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {mode === "register" && (
                <div>
                  <label className="block text-[#00003d] font-semibold mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <LockKeyhole className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Re-enter your password"
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4c896] focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {mode === "reset" && (
                <div>
                  <label className="block text-[#00003d] font-semibold mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <LockKeyhole className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="Enter your new password"
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4c896] focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#d4c896] text-[#00003d] font-semibold rounded-xl border-2 border-[#00003d] hover:bg-[#c4b886] transition-colors disabled:opacity-60"
              >
                {loading
                  ? "Please wait..."
                  : mode === "login"
                  ? "Login"
                  : mode === "register"
                  ? "Register"
                  : mode === "forgot"
                  ? "Send Reset Link"
                  : "Reset Password"}
              </button>
            </form>

            <div className="mt-6 space-y-3 text-sm">
              {mode === "login" && (
                <>
                  <div className="text-gray-600">
                    Forgot your password?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("forgot")}
                      className="text-[#00003d] font-semibold hover:opacity-70"
                    >
                      Reset it
                    </button>
                  </div>

                  <div className="text-gray-600">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("register")}
                      className="text-[#00003d] font-semibold hover:opacity-70"
                    >
                      Register
                    </button>
                  </div>
                </>
              )}

              {mode === "register" && (
                <div className="text-gray-600">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="text-[#00003d] font-semibold hover:opacity-70"
                  >
                    Login
                  </button>
                </div>
              )}

              {mode === "forgot" && (
                <>
                  <div className="text-gray-600">
                    Remembered your password?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("login")}
                      className="text-[#00003d] font-semibold hover:opacity-70"
                    >
                      Login
                    </button>
                  </div>

                  <div className="text-gray-600">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("register")}
                      className="text-[#00003d] font-semibold hover:opacity-70"
                    >
                      Register
                    </button>
                  </div>
                </>
              )}

              {mode === "reset" && (
                <div className="text-gray-600">
                  Back to{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="text-[#00003d] font-semibold hover:opacity-70"
                  >
                    Login
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
