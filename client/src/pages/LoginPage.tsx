import { useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);
      navigate(res.data.user.role === "ADMIN" ? "/admin" : "/");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (!err.response || status === 404 || status === 405 || status === 500) {
          setError("Server ulanmagan. Admin login hozircha ishlamaydi.");
          return;
        }
      }

      setError("Login xato. Email yoki parol noto'g'ri.");
    }
  };

  return (
    <div className="auth-wrap">
      <form onSubmit={onSubmit} className="auth-form">
        <p className="auth-kicker">Xush kelibsiz</p>
        <h2>Login</h2>
        <p className="auth-subtitle">Admin panel yoki shaxsiy bo'limga kirish uchun ma'lumotlarni kiriting.</p>

        <label className="field-label">
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required />
        </label>

        <label className="field-label">
          Parol
          <div className="password-field">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Parol"
              type={showPassword ? "text" : "password"}
              required
            />
            <button
              type="button"
              className="password-toggle"
              aria-label={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path fill="currentColor" d="M3.53 2.47a.75.75 0 0 0-1.06 1.06l2.1 2.1A12.34 12.34 0 0 0 1.46 12a12.9 12.9 0 0 0 3.9 4.74C7.16 18.08 9.44 19 12 19c1.98 0 3.8-.54 5.43-1.45l3.04 3.04a.75.75 0 1 0 1.06-1.06zM12 17.5c-4.26 0-7.63-3.34-8.97-5.5.7-1.13 1.95-2.56 3.68-3.59l1.32 1.32a3.75 3.75 0 0 0 5.24 5.24l3.04 3.04a9.49 9.49 0 0 1-4.31 1.49m-.75-6.77 2.02 2.02a2.25 2.25 0 0 1-2.02-2.02" />
                  <path fill="currentColor" d="M12 5c4.26 0 7.63 3.34 8.97 5.5a12.7 12.7 0 0 1-3.16 3.48.75.75 0 0 0 .9 1.2A14.1 14.1 0 0 0 22.54 12a12.9 12.9 0 0 0-3.9-4.74C16.84 5.92 14.56 5 12 5c-1.43 0-2.78.28-4.02.77a.75.75 0 1 0 .55 1.4A9.7 9.7 0 0 1 12 6.5" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path fill="currentColor" d="M12 5c-5.1 0-9.27 3.8-10.54 7 1.27 3.2 5.44 7 10.54 7s9.27-3.8 10.54-7C21.27 8.8 17.1 5 12 5m0 12.5c-4.26 0-7.63-3.34-8.97-5.5 1.34-2.16 4.71-5.5 8.97-5.5s7.63 3.34 8.97 5.5c-1.34 2.16-4.71 5.5-8.97 5.5m0-9A3.5 3.5 0 1 0 12 15a3.5 3.5 0 0 0 0-7m0 5.5A2 2 0 1 1 12 10a2 2 0 0 1 0 4" />
                </svg>
              )}
            </button>
          </div>
        </label>

        {error && <p className="error">{error}</p>}
        <button type="submit" className="auth-submit">Kirish</button>
        <a className="auth-link" href="/register">Ro'yxatdan o'tish</a>
      </form>
    </div>
  );
}
