import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Field from "../../components/common/Field";
import { useAuth } from "../../context/AuthContext";

// Đăng nhập: gọi API thật (qua AuthContext), điều hướng theo vai trò.
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/khach-hang";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }

    // Điều hướng theo vai trò
    const role = res.user?.role;
    if (role === "admin") navigate("/admin", { replace: true });
    else if (role === "lawyer") navigate("/lawyer", { replace: true });
    else navigate(from, { replace: true }); // customer
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-center text-2xl font-bold text-[var(--color-primary)]">
          Đăng nhập
        </h1>
        <p className="mt-1 text-center text-sm text-gray-500">
          Chào mừng bạn quay lại LegalEase
        </p>

        {error && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
          />
          <Field
            label="Mật khẩu"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[var(--color-primary)] px-4 py-2.5 font-semibold text-white hover:brightness-110 disabled:opacity-60"
          >
            {loading ? "Đang đăng nhập…" : "Đăng nhập"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Chưa có tài khoản?{" "}
          <Link
            to="/dang-ky"
            className="font-semibold text-[var(--color-primary)] hover:underline"
          >
            Đăng ký ngay
          </Link>
        </p>

        {/* Gợi ý tài khoản demo */}
        <div className="mt-6 rounded-md bg-gray-50 p-3 text-xs text-gray-500">
          <p className="font-semibold text-gray-600">Tài khoản dùng thử:</p>
          <p>admin@legalease.com / Admin@123</p>
          <p>lawyer1@legalease.com / Lawyer@123</p>
          <p>customer1@legalease.com / Customer@123</p>
        </div>
      </div>
    </div>
  );
}
