import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, resendVerificationEmail } from "../services/api";

const UNVERIFIED_EMAIL_MESSAGE =
  "Please verify your email before logging in.";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setNeedsVerification(false);
      setMessage("Logging in...");

      const { response, data } = await login(email, password);

      if (!response.ok) {
        const errorMessage = data.message || "Login failed";
        setMessage(errorMessage);
        setNeedsVerification(errorMessage === UNVERIFIED_EMAIL_MESSAGE);
        return;
      }

      localStorage.setItem("token", data.token);
      setMessage("Login successful");

      navigate("/dashboard");
    } catch (error) {
      console.log("LOGIN FRONTEND ERROR:", error);
      setMessage("Something went wrong. Check the console.");
    }
  }

  async function handleResendVerification() {
    try {
      setIsResending(true);
      setMessage("Sending verification email...");

      const { response, data } = await resendVerificationEmail(email);

      if (!response.ok) {
        setMessage(data.message || "Failed to resend verification email");
        return;
      }

      setMessage(data.message || "If an account exists, a verification email has been sent.");
    } catch (error) {
      console.log("RESEND VERIFICATION FRONTEND ERROR:", error);
      setMessage("Something went wrong. Check the console.");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="kazi-card w-full max-w-md p-8">
        <h1 className="kazi-page-title">Login</h1>

        <p className="mt-2 kazi-muted">Sign in to manage your projects.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="kazi-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="kazi-input"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="kazi-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="kazi-input"
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="kazi-button-primary w-full">
            Login
          </button>
        </form>

        {message && <p className="mt-4 kazi-muted">{message}</p>}

        {needsVerification && (
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={isResending || !email}
            className="mt-3 text-sm text-kazi-primary hover:underline disabled:opacity-50"
          >
            Resend verification email
          </button>
        )}
      </div>
    </div>
  );
}
