import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/register", { name, email, password, role });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);
      navigate(res.data.user.role === "ADMIN" ? "/admin" : "/login");
    } catch {
      setError("Ro'yxatdan o'tishda xatolik.");
    }
  };

  return (
    <div className="auth-wrap">
      <form onSubmit={onSubmit} className="auth-form">
        <h2>Ro'yxatdan o'tish</h2>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ism" required />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Parol" type="password" required />
        <label className="field-label">
          Account turi
          <select value={role} onChange={(e) => setRole(e.target.value as "USER" | "ADMIN") }>
            <option value="USER">Foydalanuvchi</option>
            <option value="ADMIN">Admin</option>
          </select>
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit">Ro'yxatdan o'tish</button>
        <a href="/login">Login sahifasi</a>
      </form>
    </div>
  );
}
