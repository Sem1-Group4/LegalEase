import { useEffect, useState } from 'react'
import api from '../../api/axios'
import CustomerNav from '../../components/customer/CustomerNav'
import Field from '../../components/common/Field'
import StatusBadge from '../../components/common/StatusBadge'
import { useAuth } from '../../context/AuthContext'

// Hồ sơ cá nhân khách hàng — cập nhật thông tin + xem lịch sử lịch hẹn (gọi API).
export default function Profile() {
  const { updateProfile } = useAuth()

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    city_id: '',
    address: '',
  })
  const [cities, setCities] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/cities').then((res) => setCities(res.data)).catch(() => {})

    api
      .get('/customer/profile')
      .then((res) => {
        const p = res.data
        setForm({
          name: p.name || '',
          email: p.email || '',
          phone: p.phone || '',
          city_id: p.city_id || '',
          address: p.address || '',
        })
      })
      .catch(() => setError('Không tải được hồ sơ.'))
      .finally(() => setLoading(false))

    // Lịch sử: các buổi đã hoàn tất hoặc đã hủy.
    api
      .get('/customer/appointments')
      .then((res) => setHistory(res.data.filter((a) => a.status === 'completed' || a.status === 'cancelled')))
      .catch(() => {})
  }, [])

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
    setSaved(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.put('/customer/profile', {
        name: form.name,
        phone: form.phone || null,
        city_id: form.city_id || null,
        address: form.address || null,
      })
      updateProfile({ name: form.name }) // đồng bộ tên hiển thị ở header
      setSaved(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Lưu thông tin không thành công.')
    } finally {
      setSaving(false)
    }
  }

  const selectCls =
    'w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-[var(--color-primary)] focus:outline-none'

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <CustomerNav />

      <h1 className="text-2xl font-bold text-[var(--color-primary)]">Hồ sơ cá nhân</h1>
      <p className="mt-1 text-gray-500">Cập nhật thông tin và xem lịch sử tư vấn của bạn.</p>

      {loading ? (
        <p className="mt-6 text-gray-500">Đang tải…</p>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Form thông tin */}
          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="font-bold text-gray-800">Thông tin cá nhân</h2>

            {saved && (
              <p className="mt-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
                Đã lưu thông tin thành công.
              </p>
            )}
            {error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <Field label="Họ và tên" value={form.name} onChange={(e) => set('name', e.target.value)} />
              <Field label="Email" type="email" value={form.email} disabled onChange={() => {}} />
              <Field label="Số điện thoại" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Tỉnh thành</label>
                <select value={form.city_id} onChange={(e) => set('city_id', e.target.value)} className={selectCls}>
                  <option value="">— Chọn tỉnh thành —</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <Field label="Địa chỉ" value={form.address} onChange={(e) => set('address', e.target.value)} />
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-[var(--color-primary)] px-5 py-2.5 font-semibold text-white hover:brightness-110 disabled:opacity-50"
              >
                {saving ? 'Đang lưu…' : 'Lưu thay đổi'}
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
                      <p className="text-sm text-gray-500">
                        {a.lawyer_city ? `${a.lawyer_city} · ` : ''}{a.appointment_date}
                      </p>
                    </div>
                    <StatusBadge status={a.status} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
