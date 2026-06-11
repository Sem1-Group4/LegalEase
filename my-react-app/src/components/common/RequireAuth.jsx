import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Bọc các trang cần đăng nhập.
// - Chưa đăng nhập -> chuyển về /dang-nhap (nhớ trang muốn vào).
// - Có truyền prop `role`: sai vai trò -> chặn, đưa về khu phù hợp.
//   role có thể là 1 chuỗi ('admin') hoặc mảng (['admin','lawyer']).
export default function RequireAuth({ children, role }) {
  const { user } = useAuth();
  const location = useLocation();

  // 1) Chưa đăng nhập
  if (!user) {
    return (
      <Navigate to="/dang-nhap" replace state={{ from: location.pathname }} />
    );
  }

  // 2) Có yêu cầu role mà user không khớp -> chặn
  if (role) {
    const allowed = Array.isArray(role) ? role : [role];
    if (!allowed.includes(user.role)) {
      // Đưa user về đúng khu của họ thay vì cho vào nhầm chỗ
      const home =
        user.role === "admin"
          ? "/admin"
          : user.role === "lawyer"
            ? "/lawyer"
            : "/khach-hang";
      return <Navigate to={home} replace />;
    }
  }

  return children;
}
