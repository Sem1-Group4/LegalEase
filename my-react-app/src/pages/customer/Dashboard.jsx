import { Link } from 'react-router-dom'
import CustomerNav from '../../components/customer/CustomerNav'
import StatusBadge from '../../components/common/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import { myAppointments, notifications } from '../../mock/data'

// Dashboard khách hàng — tổng quan lịch hẹn, thông báo.
export default function Dashboard() {
  const { user } = useAuth()

  const upcoming = myAppointments.filter((a) => a.status === 'pending' || a.status === 'confirmed')
  const completed = myAppointments.filter((a) => a.status === 'completed')

  const stats = [
    { label: 'Lịch sắp tới', value: upcoming.length, icon: '📅' },
    { label: 'Đã hoàn tất', value: completed.length, icon: '✅' },
    { label: 'Thông báo mới', value: notifications.filter((n) => n.unread).length, icon: '🔔' },
  ]

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <CustomerNav />

      <h1 className="text-2xl font-bold text-[var(--color-primary)]">
        Xin chào, {user?.name || 'khách hàng'} 👋
      </h1>
      <p className="mt-1 text-gray-500">Đây là tổng quan hoạt động của bạn trên LegalEase.</p>

      {/* Thống kê nhanh */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="text-3xl">{s.icon}</div>
            <p className="mt-2 text-2xl font-bold text-[var(--color-primary)]">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Lịch hẹn sắp tới */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800">Lịch hẹn sắp tới</h2>
            <Link to="/khach-hang/lich-hen" className="text-sm text-[var(--color-primary)] hover:underline">
              Xem tất cả
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <p className="mt-4 text-sm text-gray-400">Bạn chưa có lịch hẹn nào sắp tới.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {upcoming.map((a) => (
                <li key={a.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                  <div>
                    <p className="font-medium text-gray-800">{a.lawyer_name}</p>
                    <p className="text-sm text-gray-500">{a.specialization} · {a.date} lúc {a.time}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}

          <Link
            to="/tim-luat-su"
            className="mt-4 inline-block rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-gray-900 hover:brightness-95"
          >
            + Đặt lịch hẹn mới
          </Link>
        </section>

        {/* Thông báo */}
        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="font-bold text-gray-800">Thông báo</h2>
          <ul className="mt-4 space-y-3">
            {notifications.map((n) => (
              <li key={n.id} className="flex gap-2 text-sm">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.unread ? 'bg-[var(--color-accent)]' : 'bg-gray-300'}`} />
                <div>
                  <p className="text-gray-700">{n.text}</p>
                  <p className="text-xs text-gray-400">{n.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
