import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Field from '../../components/common/Field'
import { useAuth } from '../../context/AuthContext'

// Đăng nhập (mock auth — dùng tài khoản mẫu).
export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/khach-hang'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const res = login(email, password)
    if (res.ok) navigate(from, { replace: true })
    else setError(res.error)
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-center text-2xl font-bold text-[var(--color-primary)]">Đăng nhập</h1>
        <p className="mt-1 text-center text-sm text-gray-500">Chào mừng bạn quay lại LegalEase</p>

        {error && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field
            label="Email" type="email" required value={email}
            onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com"
          />
          <Field
            label="Mật khẩu" type="password" required value={password}
            onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
          />
          <button
            type="submit"
            className="w-full rounded-md bg-[var(--color-primary)] px-4 py-2.5 font-semibold text-white hover:brightness-110"
          >
            Đăng nhập
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Chưa có tài khoản?{' '}
          <Link to="/dang-ky" className="font-semibold text-[var(--color-primary)] hover:underline">Đăng ký ngay</Link>
        </p>

        {/* Gợi ý tài khoản demo */}
        <div className="mt-6 rounded-md bg-gray-50 p-3 text-xs text-gray-500">
          <p className="font-semibold text-gray-600">Tài khoản dùng thử:</p>
          <p>customer1@legalease.com / Customer@123</p>
        </div>
      </div>
    </div>
  )
}
