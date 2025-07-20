"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setErrorMsg("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setErrorMsg(error.message);
    } else {
      window.location.href = "/";
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setErrorMsg("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    setLoading(false);
    if (error) {
      setErrorMsg(error.message);
    }
    // No redirect needed here — Supabase redirects automatically
  }

  return (
    <div className="max-w-sm mx-auto p-4 mt-20 bg-gray-700 rounded text-yellow-300">
      <h1 className="text-2xl mb-4 font-bold">Login</h1>
      <input
        type="email"
        placeholder="Email"
        className="w-full p-2 mb-3 rounded bg-gray-800 text-yellow-300"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full p-2 mb-3 rounded bg-gray-800 text-yellow-300"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full p-2 bg-yellow-500 hover:bg-yellow-600 rounded text-black font-bold mb-3"
      >
        {loading ? "Logging in..." : "Log In"}
      </button>

      <div className="text-center my-4 text-yellow-300">or</div>

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full p-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-bold"
      >
        {loading ? "Loading..." : "Sign in with Google"}
      </button>

      {errorMsg && <p className="mt-3 text-red-500">{errorMsg}</p>}
    </div>
  );
}
