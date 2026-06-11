import { useEffect, useState } from "react";
import api from "../../api/axios";

// Trang Tổng quan (Dashboard) khu Admin — gọi API thật /admin/reports/overview.
function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-[var(--color-primary)]">
        {value}
      </p>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/admin/reports/overview")
      .then((res) => setStats(res.data))
      .catch(() => setError("Không tải được số liệu. Kiểm tra server backend."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Đang tải…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800">Tổng quan</h1>
      <p className="mt-1 text-gray-500">Thống kê nhanh toàn hệ thống.</p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Tổng luật sư" value={stats.tong_luat_su} />
        <StatCard label="Luật sư chờ duyệt" value={stats.luat_su_cho_duyet} />
        <StatCard label="Luật sư đã duyệt" value={stats.luat_su_da_duyet} />
        <StatCard label="Tổng khách hàng" value={stats.tong_khach_hang} />
        <StatCard label="Tổng cuộc hẹn" value={stats.tong_cuoc_hen} />
      </div>
    </div>
  );
}
