import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";

// ----- Trang Public (ai cũng xem được) -----
import Home from "./pages/public/Home";
import LawyerList from "./pages/public/LawyerList";
import LawyerDetail from "./pages/public/LawyerDetail";
import News from "./pages/public/News";
import NewsDetail from "./pages/public/NewsDetail";
import Faq from "./pages/public/Faq";
import Contact from "./pages/public/Contact";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";

// ----- Trang Customer (khu vực khách hàng) -----
import CustomerDashboard from "./pages/customer/Dashboard";
import Booking from "./pages/customer/Booking";
import MyAppointments from "./pages/customer/MyAppointments";
import ReviewForm from "./pages/customer/ReviewForm";
import Profile from "./pages/customer/Profile";

import NotFound from "./pages/NotFound";
import RequireAuth from "./components/common/RequireAuth";
import AdminLayout from "./components/layout/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminLawyerManage from "./pages/admin/LawyerManage";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Mặc định chuyển hướng về trang chủ */}
        <Route path="/" element={<Navigate to="/trangchu" replace />} />

        {/* Public */}
        <Route path="/trangchu" element={<Home />} />
        <Route path="/tim-luat-su" element={<LawyerList />} />
        <Route path="/luat-su/:id" element={<LawyerDetail />} />
        <Route path="/tin-tuc" element={<News />} />
        <Route path="/tin-tuc/:id" element={<NewsDetail />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/lien-he" element={<Contact />} />
        <Route path="/dang-nhap" element={<Login />} />
        <Route path="/dang-ky" element={<Register />} />

        {/* Customer (khu vực khách hàng) — yêu cầu đăng nhập */}
        <Route
          path="/khach-hang"
          element={
            <RequireAuth>
              <CustomerDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/khach-hang/dat-lich/:lawyerId"
          element={
            <RequireAuth>
              <Booking />
            </RequireAuth>
          }
        />
        <Route
          path="/khach-hang/lich-hen"
          element={
            <RequireAuth>
              <MyAppointments />
            </RequireAuth>
          }
        />
        <Route
          path="/khach-hang/danh-gia/:appointmentId"
          element={
            <RequireAuth>
              <ReviewForm />
            </RequireAuth>
          }
        />
        <Route
          path="/khach-hang/ho-so"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Khu admin - layout riêng, chỉ admin vào được */}
      <Route
        element={
          <RequireAuth role="admin">
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/luat-su" element={<AdminLawyerManage />} />
      </Route>
    </Routes>
  );
}

export default App;
