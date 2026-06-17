import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import CustomerNav from '../../components/customer/CustomerNav'
import StatusBadge from '../../components/common/StatusBadge'
import EmptyState from '../../components/common/EmptyState'

const FILTERS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'completed', label: 'Hoàn tất' },
  { value: 'cancelled', label: 'Đã hủy' },
]

// Lịch hẹn của tôi — xem, lọc theo trạng thái, hủy, đánh giá (gọi API).
export default function MyAppointments() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  function load() {
    setLoading(true)
    setError('')
    api
      .get('/customer/appointments')
      .then((res) => setItems(res.data))
      .catch(() => setError('Không tải được lịch hẹn.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const visible = filter === 'all' ? items : items.filter((a) => a.status === filter)

  async function cancel(id) {
    if (!confirm('Bạn chắc chắn muốn hủy lịch hẹn này?')) return
    try {
      await api.patch(`/customer/appointments/${id}/cancel`)
      load()
    } catch (err) {
      alert(err.response?.data?.message || 'Hủy lịch không thành công.')
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <CustomerNav />

      <h1 className="text-2xl font-bold text-[var(--color-primary)]">Lịch hẹn của tôi</h1>
      <p className="mt-1 text-gray-500">Theo dõi, hủy và đánh giá các buổi tư vấn.</p>

      {/* Bộ lọc trạng thái */}
      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              filter === f.value
                ? 'bg-[var(--color-primary)] text-white'
                : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-6 text-gray-500">Đang tải…</p>
      ) : error ? (
        <p className="mt-6 text-red-600">{error}</p>
      ) : visible.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="Không có lịch hẹn nào" description="Hãy tìm luật sư và đặt lịch hẹn đầu tiên của bạn." icon="📅" />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {visible.map((a) => (
            <div key={a.id} className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-800">{a.lawyer_name}</h3>
                  <StatusBadge status={a.status} />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {a.lawyer_city ? `${a.lawyer_city} · ` : ''}{a.appointment_date} lúc {a.start_time}{a.end_time ? ` – ${a.end_time}` : ''}
                </p>
                {a.customer_note && <p className="mt-1 text-sm text-gray-400">Ghi chú: {a.customer_note}</p>}
                {a.status === 'cancelled' && a.cancel_reason && (
                  <p className="mt-1 text-sm text-red-400">Lý do hủy: {a.cancel_reason}</p>
                )}
              </div>

              <div className="flex gap-2">
                {(a.status === 'pending' || a.status === 'confirmed') && (
                  <button
                    onClick={() => cancel(a.id)}
                    className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Hủy lịch
                  </button>
                )}
                {a.can_review && (
                  <Link
                    to={`/khach-hang/danh-gia/${a.id}`}
                    className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-gray-900 hover:brightness-95"
                  >
                    Đánh giá
                  </Link>
                )}
                {a.has_review && (
                  <span className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-400">Đã đánh giá</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
