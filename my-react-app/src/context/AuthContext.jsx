import { createContext, useContext, useEffect, useState } from 'react'

// =============================================================
// Mock auth đơn giản cho demo (chưa nối API thật).
// Lưu user vào localStorage để giữ đăng nhập khi tải lại trang.
// Khi có backend: thay loginMock bằng api.post('/auth/login', ...).
// =============================================================

const AuthContext = createContext(null)

// Tài khoản mẫu (trùng với phần "Tài khoản đăng nhập thử" trong hướng dẫn).
const SAMPLE_USERS = [
  { email: 'customer1@legalease.com', password: 'Customer@123', name: 'Khách hàng Demo', role: 'customer', phone: '0909 000 111', city: 'Hà Nội' },
  { email: 'lawyer1@legalease.com', password: 'Lawyer@123', name: 'LS. Nguyễn Văn An', role: 'lawyer' },
  { email: 'admin@legalease.com', password: 'Admin@123', name: 'Quản trị viên', role: 'admin' },
]

const STORAGE_KEY = 'legalease_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    else localStorage.removeItem(STORAGE_KEY)
  }, [user])

  // Trả về { ok, error } để form xử lý thông báo lỗi.
  function login(email, password) {
    const found = SAMPLE_USERS.find(
      (u) => u.email === email.trim().toLowerCase() && u.password === password,
    )
    if (!found) return { ok: false, error: 'Email hoặc mật khẩu không đúng.' }
    const safe = { ...found }
    delete safe.password
    setUser(safe)
    return { ok: true }
  }

  // Đăng ký mẫu: chấp nhận mọi thông tin hợp lệ, đăng nhập luôn.
  function register(data) {
    setUser({ name: data.name, email: data.email, role: data.role || 'customer', phone: data.phone, city: data.city })
    return { ok: true }
  }

  function logout() {
    setUser(null)
  }

  // Cập nhật hồ sơ (trang Profile).
  function updateProfile(patch) {
    setUser((prev) => ({ ...prev, ...patch }))
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth phải dùng bên trong <AuthProvider>')
  return ctx
}
