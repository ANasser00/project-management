"use client";

import React, { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function AuthProvider({ children }: any) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/auth/me`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;

    const endpoint = isLogin ? "/auth/login" : "/auth/register";
    const body: any = { email, password };

    if (!isLogin) {
      const username = (form.elements.namedItem("username") as HTMLInputElement)
        .value;
      body.username = username;
    }

    try {
      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        if (isLogin) {
          setUser(data.user);
        } else {
          setIsLogin(true);
          setError("Registration successful! Please log in.");
        }
      } else {
        const errData = await res.json();
        setError(errData.message || "Authentication failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white p-8 shadow-xl">
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h1>
              <p className="text-gray-600">
                {isLogin
                  ? "Sign in to continue to your dashboard"
                  : "Sign up to get started"}
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
              {!isLogin && (
                <div>
                  <label
                    htmlFor="username"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 transition duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="johndoe"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 transition duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 transition duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div
                  className={`rounded-lg p-4 ${
                    error.includes("successful")
                      ? "border border-green-200 bg-green-50 text-green-800"
                      : "border border-red-200 bg-red-50 text-red-800"
                  }`}
                >
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full transform rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition duration-200 hover:scale-[1.02] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isLogin ? "Sign In" : "Create Account"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Secure authentication powered by JWT</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
