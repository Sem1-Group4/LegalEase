import { useState } from 'react'
import { Link } from 'react-router-dom'
import CustomerNav from '../../components/customer/CustomerNav'
import StatusBadge from '../../components/common/StatusBadge'
import EmptyState from '../../components/common/EmptyState'
import { myAppointments } from '../../mock/data'

const FILTERS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'completed', label: 'Hoàn tất' },
  { value: 'cancelled', label: 'Đã hủy' },
]

// Lịch hẹn của tôi — xem, lọc theo trạng thái, hủy, đánh giá.
export default function MyAppointments() {
  // Bản sao cục bộ để demo thao tác hủy lịch.
  const [items, setItems] = useState(() => myAppointments.map((a) => ({ ...a })))
  const [filter, setFilter] = useState('all')

  const visible = filter === 'all' ? items : items.filter((a) => a.status === filter)

  function cancel(id) {
    setItems((list) => list.map((a) => (a.id === id ? { ...a, status: 'cancelled' } : a)))
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

      {visible.length === 0 ? (
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
                <p className="mt-1 text-sm text-gray-500">{a.specialization} · {a.date} lúc {a.time}</p>
                {a.note && <p className="mt-1 text-sm text-gray-400">Ghi chú: {a.note}</p>}
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
                {a.status === 'completed' && (
                  <Link
                    to={`/khach-hang/danh-gia/${a.id}`}
                    className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-gray-900 hover:brightness-95"
                  >
                    Đánh giá
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
