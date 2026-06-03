import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="mt-auto bg-[var(--color-primary)] text-gray-200">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="text-lg font-extrabold text-white">
            Legal<span className="text-[var(--color-accent)]">Ease</span>
          </p>
          <p className="mt-2 text-sm text-gray-300">
            Nền tảng đặt lịch hẹn luật sư trực tuyến hàng đầu Việt Nam.
          </p>
        </div>

        {/* Sitemap (yêu cầu trong đề bài) */}
        <div>
          <p className="font-semibold text-white">Sitemap</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li><Link to="/trangchu" className="hover:text-white">Trang chủ</Link></li>
            <li><Link to="/tim-luat-su" className="hover:text-white">Tìm luật sư</Link></li>
            <li><Link to="/tin-tuc" className="hover:text-white">Tin tức pháp lý</Link></li>
            <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
            <li><Link to="/lien-he" className="hover:text-white">Liên hệ</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-semibold text-white">Tài khoản</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li><Link to="/dang-nhap" className="hover:text-white">Đăng nhập</Link></li>
            <li><Link to="/dang-ky" className="hover:text-white">Đăng ký</Link></li>
            <li><Link to="/khach-hang" className="hover:text-white">Khu vực khách hàng</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-gray-400">
        © 2026 LegalEase — Đồ án eProject (Aptech).
      </div>
    </footer>
  )
}
