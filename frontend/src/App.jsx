// src/App.jsx
import { useState } from "react";
import LoginPage from "./pages/LoginPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";

export default function App() {
  // null = not logged in yet
  const [user, setUser] = useState(null);

  // Called when login succeeds in LoginPage
  function handleLoggedIn(data) {
    // you can store whatever you want here: token, email, etc.
    setUser(data);
  }

  // If not logged in, show the login page
  if (!user) {
    return (
      <div className="bubblebiz-page">
        <LoginPage onLoggedIn={handleLoggedIn} />
      </div>
    );
  }

  // After login, show the dashboard
  return (
    <div className="bubblebiz-page">
      <Dashboard user={user} />
    </div>
  );
}
