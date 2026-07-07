import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);
      navigate(res.data.user.role === "ADMIN" ? "/admin" : "/");
    } catch {
      setError("Login xato. Email yoki parol noto'g'ri.");
    }
  };

  return (
    <div className="auth-wrap">
      <form onSubmit={onSubmit} className="auth-form">
        <h2>Login</h2>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Parol" type="password" required />
        {error && <p className="error">{error}</p>}
        <button type="submit">Kirish</button>
        <a href="/register">Ro'yxatdan o'tish</a>
      </form>
    </div>
  );
}
