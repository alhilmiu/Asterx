
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(email, password);
      const destination = location.state?.from?.pathname || "/admin";
      navigate(destination, { replace: true });
    } catch {
      setError("Login gagal. Pastikan backend dan akun sudah disiapkan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <Link to="/" className="back-link">← Kembali ke website</Link>

        <div className="brand login-brand">
          <div className="brand-mark">M</div>
          <div>
            <strong>MAZIYAN</strong>
            <small>MAKEUP ARTIST</small>
          </div>
        </div>

        <span className="eyebrow">MANAGEMENT SYSTEM</span>
        <h1>Selamat datang</h1>
        <p className="muted">Masuk menggunakan akun pengelola.</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {error && <p className="form-error">{error}</p>}

          <button className="button button-primary button-full" disabled={loading}>
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </section>
    </main>
  );
}
