import { NavLink } from 'react-router-dom'

// Thanh điều hướng phụ trong khu khách hàng.
const items = [
  { to: '/khach-hang', label: 'Tổng quan', end: true },
  { to: '/khach-hang/lich-hen', label: 'Lịch hẹn của tôi' },
  { to: '/khach-hang/ho-so', label: 'Hồ sơ cá nhân' },
]

export default function CustomerNav() {
  const cls = ({ isActive }) =>
    `rounded-md px-4 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-[var(--color-primary)] text-white'
        : 'text-gray-600 hover:bg-gray-100'
    }`

  return (
    <nav className="mb-6 flex flex-wrap gap-2 border-b border-gray-200 pb-4">
      {items.map((it) => (
        <NavLink key={it.to} to={it.to} end={it.end} className={cls}>
          {it.label}
        </NavLink>
      ))}
    </nav>
  )
}
