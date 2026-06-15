import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";


// type HealthResponse = {
//   status: string;
//   service: string;
// };

function App() {
 return (
  <BrowserRouter>
  <nav>
    
    <Link to="/login">Login</Link>{" "}
    <Link to="/register">Register</Link>{" "}
    <Link to="/dashboard">Dashboard</Link>{" "}
    </nav>
    
    <Routes>

      <Route path="/login" element={<LoginPage></LoginPage>}></Route>
      <Route path="/register" element={<RegisterPage></RegisterPage>}></Route>
      <Route path="/dashboard" element={<DashboardPage></DashboardPage>}></Route>


    </Routes>

    
    </BrowserRouter>
 )
};

export default App;