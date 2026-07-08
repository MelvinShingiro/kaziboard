import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { verifyEmail } from "../services/api";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );
  const [message, setMessage] = useState("Verifying...");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing.");
      return;
    }

    let cancelled = false;

    async function runVerification() {
      try {
        const { response, data } = await verifyEmail(token!);

        if (cancelled) {
          return;
        }

        if (!response.ok) {
          setStatus("error");
          setMessage(data.message || "Email verification failed.");
          return;
        }

        setStatus("success");
        setMessage(data.message || "Email verified. You can now log in.");
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.log("VERIFY EMAIL FRONTEND ERROR:", error);
        setStatus("error");
        setMessage("Something went wrong while verifying your email.");
      }
    }

    void runVerification();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="kazi-card w-full max-w-md p-8 text-center">
        <h1 className="kazi-page-title">Verify Email</h1>

        <p className="mt-4 kazi-muted">{message}</p>

        {status !== "verifying" && (
          <Link
            to="/login"
            className="kazi-button-primary mt-6 inline-block"
          >
            Go to login
          </Link>
        )}
      </div>
    </div>
  );
}
