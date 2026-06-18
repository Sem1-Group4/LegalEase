import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Layout riêng cho khu Admin: sidebar trái + vùng nội dung phải.
const NAV = [
  { to: "/admin", label: "Tổng quan", end: true },
  { to: "/admin/luat-su", label: "Quản lý luật sư" },
  { to: "/admin/linh-vuc", label: "Lĩnh vực hành nghề" },
  { to: "/admin/khach-hang", label: "Quản lý khách hàng" },
  { to: "/admin/lich-hen", label: "Giám sát lịch hẹn" },
  { to: "/admin/noi-dung", label: "Quản lý nội dung" },
  { to: "/admin/bao-cao", label: "Báo cáo & thống kê" },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/dang-nhap");
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-64 shrink-0 bg-[var(--color-primary)] text-white flex flex-col">
        <Link to="/trangchu" className="mb-6 block px-2">
          <p className="text-xl font-bold text-white">
            Legal<span className="text-[var(--color-accent)]">Ease</span>
          </p>
          <p className="text-xs text-white/60">Trang quản trị</p>
        </Link>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-white/10 text-sm">
          <p className="text-white/60">Đăng nhập:</p>
          <p className="font-medium truncate">{user?.name || "Admin"}</p>
          <button
            onClick={handleLogout}
            className="mt-3 w-full rounded-lg bg-white/10 hover:bg-white/20 py-2 text-sm font-medium transition"
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
