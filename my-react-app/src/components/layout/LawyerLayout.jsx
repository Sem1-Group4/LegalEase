import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function LawyerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/dang-nhap");
  }

  const linkClass = ({ isActive }) =>
    `block rounded-lg px-4 py-2.5 text-sm font-medium transition ${
      isActive
        ? "bg-white/15 text-white"
        : "text-white/70 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col bg-[var(--color-primary)] p-4">
        <div className="mb-6 px-2">
          <p className="text-xl font-bold text-white">
            Legal<span className="text-[var(--color-accent)]">Ease</span>
          </p>
          <p className="text-xs text-white/60">Trang luật sư</p>
        </div>

        <nav className="flex-1 space-y-1">
          <NavLink to="/lawyer" end className={linkClass}>
            Tổng quan
          </NavLink>
          <NavLink to="/lawyer/ho-so" className={linkClass}>
            Hồ sơ của tôi
          </NavLink>
          <NavLink to="/lawyer/khung-gio" className={linkClass}>
            Khung giờ rảnh
          </NavLink>
          <NavLink to="/lawyer/lich-hen" className={linkClass}>
            Lịch hẹn
          </NavLink>
        </nav>

        <div className="mt-4 border-t border-white/15 pt-4">
          <p className="px-2 text-xs text-white/60">Đăng nhập:</p>
          <p className="px-2 text-sm font-semibold text-white">
            {user?.name || "Luật sư"}
          </p>
          <button
            onClick={handleLogout}
            className="mt-3 w-full rounded-lg bg-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/20"
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Nội dung */}
      <main className="flex-1 bg-gray-50 p-8">
        <Outlet />
      </main>
    </div>
  );
}
