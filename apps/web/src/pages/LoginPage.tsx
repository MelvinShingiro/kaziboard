import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setMessage("Logging in...");

      const { response, data } = await login(email, password);

      if (!response.ok) {
        setMessage(data.message || "Login failed");
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
      </div>
    </div>
  );
}