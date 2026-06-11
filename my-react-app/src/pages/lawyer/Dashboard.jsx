import { useEffect, useState } from "react";
import api from "../../api/axios";

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-[var(--color-primary)]">
        {value ?? 0}
      </p>
    </div>
  );
}

export default function LawyerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/lawyer/dashboard")
      .then((res) => setData(res.data))
      .catch(() => setError("Không tải được dữ liệu tổng quan."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Đang tải…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800">Tổng quan</h1>
      <p className="mt-1 text-gray-500">Hoạt động của bạn trên LegalEase.</p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tổng cuộc hẹn" value={data?.tong_cuoc_hen} />
        <StatCard label="Chờ xác nhận" value={data?.cho_xac_nhan} />
        <StatCard label="Đã xác nhận" value={data?.da_xac_nhan} />
        <StatCard label="Đã hoàn thành" value={data?.da_hoan_thanh} />
      </div>
    </div>
  );
}
