import React, { useState } from "react";
import BubbleLayout from "../components/BubbleLayout";
import { login } from "../api.js"; // Corrected import path

export default function LoginPage({ onLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await login({ email, password });
      onLoggedIn(data); // Pass user data to parent
    } catch (err) {
      console.error(err);
      setError("Login failed. Please try again.");
    }
  };

  return (
    <BubbleLayout className="bubble-layout-centered"> {/* Added class for centering */}
      <div className="bubble-card bubble-card-sm"> {/* Added card for login form */}
        <p className="text-gray-500 mb-5">
          Enter your account to manage your inventory.
        </p>
        <h1 className="text-2xl font-semibold text-sky-500 mb-2">
        Login to BubbleBiz
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
        {error && <p className="text-red-500">{error}</p>}
        <input
          className="bubble-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="bubble-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="bubble-btn" type="submit">
          Log In
        </button>
      </form>
      </div>
    </BubbleLayout>
  );
}