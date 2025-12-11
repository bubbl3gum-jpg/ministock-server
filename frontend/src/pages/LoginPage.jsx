// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { login } from "../api"; // adjust path if your api file is elsewhere
import "../BubbleBiz.css"; // only if you use this for styling

export default function LoginPage({ onLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login({ email, password });
      // data should be whatever your backend returns: token, user, etc.
      onLoggedIn(data);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bubblebiz-page min-h-screen flex items-center justify-center px-4">
      <div className="bubblebiz-card w-full max-w-md">
        <h1 className="bubblebiz-title mb-2 text-center">MiniStock Login</h1>
        <p className="bubblebiz-subtitle mb-6 text-center">
          Sign in to manage your inventory
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="bubblebiz-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="bubblebiz-input w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="bubblebiz-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="bubblebiz-input w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bubblebiz-error text-sm mt-1">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="bubblebiz-button w-full mt-2"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Get Started"}
          </button>
        </form>
      </div>
    </div>
  );
}
