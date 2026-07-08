import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import DashboardPage from "./pages/DashboardPage";
import ProjectPage from "./pages/ProjectPage";

function NavBar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <nav className="border-b border-kazi-border bg-kazi-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <h1 className="text-xl font-bold tracking-tight">KaziBoard</h1>

        <div className="flex gap-4 text-sm font-medium text-kazi-muted">
          <Link className="hover:text-kazi-primary" to="/login">
            Login
          </Link>

          <Link className="hover:text-kazi-primary" to="/register">
            Register
          </Link>

          <Link className="hover:text-kazi-primary" to="/dashboard">
            Dashboard
          </Link>

          <button onClick={handleLogout} className="hover:text-kazi-primary">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-kazi-bg text-kazi-text">
        <NavBar />

        <main className="mx-auto max-w-6xl px-6 py-8">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/projects/:id" element={<ProjectPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;