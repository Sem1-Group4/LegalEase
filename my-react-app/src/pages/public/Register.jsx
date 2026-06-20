import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Field from '../../components/common/Field'
import { useAuth } from '../../context/AuthContext'

// Đăng ký (chung cho Customer & Lawyer) — mock, đăng nhập luôn sau khi đăng ký.
export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '', role: 'customer' })
  const [error, setError] = useState('')

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.name || !form.email || !form.password) {
      return setError('Vui lòng điền đầy đủ thông tin bắt buộc.')
    }
    if (form.password !== form.confirm) {
      return setError('Mật khẩu nhập lại không khớp.')
    }
    register(form)
    navigate(form.role === 'lawyer' ? '/trangchu' : '/khach-hang', { replace: true })
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-center text-2xl font-bold text-[var(--color-primary)]">Đăng ký tài khoản</h1>
        <p className="mt-1 text-center text-sm text-gray-500">Tạo tài khoản để đặt lịch hẹn luật sư</p>

        {error && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Chọn vai trò */}
          <div>
            <span className="mb-1 block text-sm font-medium text-gray-700">Bạn là</span>
            <div className="flex gap-2">
              {[
                { value: 'customer', label: 'Khách hàng' },
                { value: 'lawyer', label: 'Luật sư' },
              ].map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => set('role', r.value)}
                  className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium ${
                    form.role === r.value
                      ? 'border-[var(--color-primary)] bg-blue-50 text-[var(--color-primary)]'
                      : 'border-gray-300 text-gray-600'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <Field label="Họ và tên" required value={form.name} onChange={(e) => set('name', e.target.value)} />
          <Field label="Email" type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} />
          <Field label="Số điện thoại" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          <Field label="Mật khẩu" type="password" required value={form.password} onChange={(e) => set('password', e.target.value)} />
          <Field label="Nhập lại mật khẩu" type="password" required value={form.confirm} onChange={(e) => set('confirm', e.target.value)} />

          <button
            type="submit"
            className="w-full rounded-md bg-[var(--color-primary)] px-4 py-2.5 font-semibold text-white hover:brightness-110"
          >
            Đăng ký
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Đã có tài khoản?{' '}
          <Link to="/dang-nhap" className="font-semibold text-[var(--color-primary)] hover:underline">Đăng nhập</Link>
        </p>
      </div>
    </div>
  )
}
