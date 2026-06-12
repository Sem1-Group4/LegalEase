import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// Các mục menu Public
const navItems = [
  { to: '/trangchu', label: 'Trang chủ' },
  { to: '/tim-luat-su', label: 'Tìm luật sư' },
  { to: '/tin-tuc', label: 'Tin tức' },
  { to: '/faq', label: 'FAQ' },
  { to: '/lien-he', label: 'Liên hệ' },
]

// Trang khu vực riêng tương ứng với vai trò đăng nhập
function homePathByRole(role) {
  switch (role) {
    case 'admin':
      return '/admin'
    case 'lawyer':
      return '/lawyer'
    default:
      return '/khach-hang'
  }
}

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const linkClass = ({ isActive }) =>
    `px-1 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-accent)]'
        : 'text-gray-600 hover:text-[var(--color-primary)]'
    }`

  function handleLogout() {
    logout()
    navigate('/trangchu')
  }

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link to="/trangchu" className="flex items-center gap-1 text-xl font-extrabold">
          <span className="text-[var(--color-primary)]">Legal</span>
          <span className="text-[var(--color-accent)]">Ease</span>
        </Link>

        {/* Menu */}
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Khu vực tài khoản */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to={homePathByRole(user.role)}
                className="hidden text-sm font-medium text-gray-700 hover:text-[var(--color-primary)] sm:inline"
              >
                Xin chào, <span className="font-semibold">{user.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link
                to="/dang-ky"
                className="hidden text-sm font-medium text-gray-600 hover:text-[var(--color-primary)] sm:inline"
              >
                Đăng ký
              </Link>
              <Link
                to="/dang-nhap"
                className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-gray-900 hover:brightness-95"
              >
                Đăng nhập
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
