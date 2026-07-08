import { useState } from "react";
import { Link } from "react-router-dom";
import { register } from "../services/api";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsSuccess(false);
      setMessage("Creating account...");

      const { response, data } = await register(name, email, password);

      if (!response.ok) {
        if (data.errors && data.errors.length > 0) {
          setMessage(data.errors[0].message);
        } else {
          setMessage(data.message || "Register failed");
        }
        return;
      }

      setIsSuccess(true);
      setMessage(
        "Account created. Check your email to verify your account before logging in."
      );
    } catch (error) {
      console.log("REGISTER FRONTEND ERROR:", error);
      setMessage("Something went wrong. Check the console.");
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="kazi-card w-full max-w-md p-8">
        <h1 className="kazi-page-title">Register</h1>

        <p className="mt-2 kazi-muted">
          Create your account to start managing your projects.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="kazi-label">Name</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="kazi-input"
              placeholder="Enter your name"
            />
          </div>

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
            Register
          </button>
        </form>

        {message && <p className="mt-4 kazi-muted">{message}</p>}

        {isSuccess && (
          <p className="mt-4 text-sm">
            <Link className="text-kazi-primary hover:underline" to="/login">
              Go to login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
