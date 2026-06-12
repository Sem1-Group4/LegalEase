import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

// =============================================================
// Auth: ưu tiên gọi API thật (Laravel + Sanctum).
// Nếu server tắt / lỗi mạng -> fallback về tài khoản mẫu để vẫn demo được.
// Lưu cả token (cho axios đính vào request) và user (có role) vào localStorage.
// =============================================================

const AuthContext = createContext(null);

// Tài khoản mẫu dùng khi KHÔNG gọi được API (server tắt).
const SAMPLE_USERS = [
  {
    email: "customer1@legalease.com",
    password: "Customer@123",
    name: "Khách hàng Demo",
    role: "customer",
    phone: "0909 000 111",
    city: "Hà Nội",
  },
  {
    email: "lawyer1@legalease.com",
    password: "Lawyer@123",
    name: "LS. Nguyễn Văn An",
    role: "lawyer",
  },
  {
    email: "admin@legalease.com",
    password: "Admin@123",
    name: "Quản trị viên",
    role: "admin",
  },
];

const USER_KEY = "legalease_user";
const TOKEN_KEY = "token"; // trùng key mà axios.js đọc

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user]);

  // Đăng nhập: thử API thật trước, lỗi mạng thì fallback mock.
  async function login(email, password) {
    const cleanEmail = email.trim().toLowerCase();

    // --- 1) Thử gọi API thật ---
    try {
      const res = await api.post("/auth/login", {
        email: cleanEmail,
        password,
      });
      const { token, user: apiUser } = res.data;
      if (token) localStorage.setItem(TOKEN_KEY, token);
      setUser(apiUser);
      return { ok: true, user: apiUser };
    } catch (err) {
      // Sai email/mật khẩu thật -> báo lỗi luôn, KHÔNG fallback.
      if (err.response && err.response.status === 422) {
        return { ok: false, error: "Email hoặc mật khẩu không đúng." };
      }
      // Còn lại (server tắt, mạng lỗi...) -> thử fallback mock bên dưới.
    }

    // --- 2) Fallback: tài khoản mẫu (khi server không phản hồi) ---
    const found = SAMPLE_USERS.find(
      (u) => u.email === cleanEmail && u.password === password,
    );
    if (!found) return { ok: false, error: "Email hoặc mật khẩu không đúng." };

    const safe = { ...found };
    delete safe.password;
    localStorage.removeItem(TOKEN_KEY); // mock không có token thật
    setUser(safe);
    return { ok: true, user: safe };
  }

  // Đăng ký: chỉ tạo tài khoản khách hàng (luật sư do admin cấp sẵn).
  // Thử API thật, lỗi mạng thì fallback tạo user tạm.
  async function register(data) {
    try {
      const res = await api.post("/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation ?? data.password,
      });
      const { token, user: apiUser } = res.data;
      if (token) localStorage.setItem(TOKEN_KEY, token);
      setUser(apiUser);
      return { ok: true, user: apiUser };
    } catch (err) {
      if (err.response && err.response.status === 422) {
        const msg = err.response.data?.message || "Đăng ký không hợp lệ.";
        return { ok: false, error: msg };
      }
      // Server tắt -> fallback tạo user tạm để demo
      const safe = {
        name: data.name,
        email: data.email,
        role: "customer",
        phone: data.phone,
        city: data.city,
      };
      setUser(safe);
      return { ok: true, user: safe };
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }

  function updateProfile(patch) {
    setUser((prev) => ({ ...prev, ...patch }));
  }

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải dùng bên trong <AuthProvider>");
  return ctx;
}
