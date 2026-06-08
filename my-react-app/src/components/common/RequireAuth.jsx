import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// Bọc các trang khu khách hàng: chưa đăng nhập -> chuyển về /dang-nhap.
// Ghi nhớ trang muốn vào để sau khi đăng nhập quay lại.
export default function RequireAuth({ children }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/dang-nhap" replace state={{ from: location.pathname }} />
  }
  return children
}
