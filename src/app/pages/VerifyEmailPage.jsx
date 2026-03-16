import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { env } from "../../config/env";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("Verifying your email...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setMessage("Verification token is missing.");
      setLoading(false);
      return;
    }

    const run = async () => {
      try {
        const res = await fetch(`${env.apiBase}/auth/verify-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const json = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(json?.detail || "Email verification failed");
        }

        setMessage(json?.message || "Email verified successfully.");
      } catch (err) {
        setMessage(err.message || "Email verification failed.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#f5f3e8] pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <h1 className="text-4xl font-bold text-[#00003d] mb-4">
            Email Verification
          </h1>

          <p className="text-gray-700 mb-6">{message}</p>

          {!loading && (
            <Link
              to="/admin"
              className="inline-flex items-center px-6 py-3 bg-[#d4c896] text-[#00003d] rounded-lg border-2 border-[#00003d] hover:bg-[#c4b886] transition-colors"
            >
              Go to Admin Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
