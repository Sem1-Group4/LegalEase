import { Link } from 'react-router-dom'

// Trang 404 — không tìm thấy đường dẫn
export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-5xl font-extrabold text-[var(--color-primary)]">404</h1>
      <p className="mt-3 text-gray-600">Không tìm thấy trang bạn yêu cầu.</p>
      <Link
        to="/trangchu"
        className="mt-6 inline-block rounded-md bg-[var(--color-accent)] px-5 py-2 font-semibold text-gray-900 hover:brightness-95"
      >
        Về trang chủ
      </Link>
    </div>
  )
}
