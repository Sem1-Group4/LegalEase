import { NavLink, Link } from 'react-router-dom'

// Các mục menu Public
const navItems = [
  { to: '/trangchu', label: 'Trang chủ' },
  { to: '/tim-luat-su', label: 'Tìm luật sư' },
  { to: '/tin-tuc', label: 'Tin tức' },
  { to: '/faq', label: 'FAQ' },
  { to: '/lien-he', label: 'Liên hệ' },
]

export default function Header() {
  const linkClass = ({ isActive }) =>
    `px-1 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-accent)]'
        : 'text-gray-600 hover:text-[var(--color-primary)]'
    }`

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
          <Link
            to="/khach-hang"
            className="hidden text-sm font-medium text-gray-600 hover:text-[var(--color-primary)] sm:inline"
          >
            Khu vực khách hàng
          </Link>
          <Link
            to="/dang-nhap"
            className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-gray-900 hover:brightness-95"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </header>
  )
}
