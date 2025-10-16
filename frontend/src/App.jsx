import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import PasswordGenerator from "./pages/PasswordGenerator";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import InteractiveParticles from "./components/InteractiveParticles";

// Navigační komponenta s podmíněným zobrazením
const Navigation = () => {
  const { isAuthenticated, logout } = useAuth();

  // Podmíněná CSS třída podle stavu přihlášení
  const navbarClass = isAuthenticated ? "navbar navbar-authenticated" : "navbar navbar-public";

  return (
    <nav className={navbarClass}>
      <div className="links">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard">Přehled</Link>
            <Link to="/generator">Vytvořit heslo</Link>
            <button onClick={logout}>
              Odhlásit se
            </button>
          </>
        ) : (
          <>
            <Link to="/">Domů</Link>
            <Link to="/login">Přihlášení</Link>
            <Link to="/register">Registrace</Link>
          </>
        )}
      </div>
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          {/* Interaktivní částice */}
          <InteractiveParticles />
          <Navigation />
          <Routes>
            <Route path="/" element={
              <PublicRoute>
                <Landing />
              </PublicRoute>
            } />
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/generator" element={
              <ProtectedRoute>
                <PasswordGenerator />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;