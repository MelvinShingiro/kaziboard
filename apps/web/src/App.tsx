import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-kazi-bg text-kazi-text">
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
            </div>
          </div>
        </nav>

        <main className="mx-auto max-w-6xl px-6 py-8">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;