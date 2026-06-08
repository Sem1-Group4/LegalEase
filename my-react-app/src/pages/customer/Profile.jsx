import { useState } from 'react'
import CustomerNav from '../../components/customer/CustomerNav'
import Field from '../../components/common/Field'
import StatusBadge from '../../components/common/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import { myAppointments } from '../../mock/data'

// Hồ sơ cá nhân khách hàng — cập nhật thông tin + xem lịch sử lịch hẹn.
export default function Profile() {
  const { user, updateProfile } = useAuth()

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.city || '',
  })
  const [saved, setSaved] = useState(false)

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
    setSaved(false)
  }

  function handleSubmit(e) {
    e.preventDefault()
    updateProfile(form)
    setSaved(true)
  }

  // Lịch sử: các buổi đã hoàn tất hoặc đã hủy.
  const history = myAppointments.filter((a) => a.status === 'completed' || a.status === 'cancelled')

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <CustomerNav />

      <h1 className="text-2xl font-bold text-[var(--color-primary)]">Hồ sơ cá nhân</h1>
      <p className="mt-1 text-gray-500">Cập nhật thông tin và xem lịch sử tư vấn của bạn.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Form thông tin */}
        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="font-bold text-gray-800">Thông tin cá nhân</h2>

          {saved && (
            <p className="mt-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
              Đã lưu thông tin thành công.
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <Field label="Họ và tên" value={form.name} onChange={(e) => set('name', e.target.value)} />
            <Field label="Email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
            <Field label="Số điện thoại" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            <Field label="Tỉnh thành" value={form.city} onChange={(e) => set('city', e.target.value)} />
            <button
              type="submit"
              className="rounded-md bg-[var(--color-primary)] px-5 py-2.5 font-semibold text-white hover:brightness-110"
            >
              Lưu thay đổi
            </button>
          </form>
        </section>

        {/* Lịch sử tư vấn */}
        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="font-bold text-gray-800">Lịch sử tư vấn</h2>
          {history.length === 0 ? (
            <p className="mt-4 text-sm text-gray-400">Chưa có lịch sử tư vấn.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {history.map((a) => (
                <li key={a.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                  <div>
                    <p className="font-medium text-gray-800">{a.lawyer_name}</p>
                    <p className="text-sm text-gray-500">{a.specialization} · {a.date}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
