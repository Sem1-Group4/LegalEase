import { useEffect, useState } from "react";
import api from "../../api/axios";

// Thẻ số liệu nhỏ.
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

export default function Reports() {
  const [overview, setOverview] = useState(null);
  const [byCity, setByCity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Gọi song song 2 API báo cáo.
    Promise.all([
      api.get("/admin/reports/overview"),
      api.get("/admin/reports/lawyers-by-city"),
    ])
      .then(([resOverview, resByCity]) => {
        setOverview(resOverview.data);
        setByCity(resByCity.data);
      })
      .catch(() => setError("Không tải được dữ liệu báo cáo."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Đang tải…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  // Lấy thống kê cuộc hẹn theo trạng thái (nếu backend trả về).
  const byStatus = overview?.cuoc_hen_theo_trang_thai || {};
  const STATUS_LABEL = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    completed: "Hoàn tất",
    cancelled: "Đã hủy",
    rescheduled: "Đã dời",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800">Báo cáo & thống kê</h1>
      <p className="mt-1 text-gray-500">Tổng hợp hoạt động toàn hệ thống.</p>

      {/* Thẻ số liệu tổng */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Tổng luật sư" value={overview?.tong_luat_su} />
        <StatCard
          label="Luật sư chờ duyệt"
          value={overview?.luat_su_cho_duyet}
        />
        <StatCard label="Luật sư đã duyệt" value={overview?.luat_su_da_duyet} />
        <StatCard label="Tổng khách hàng" value={overview?.tong_khach_hang} />
        <StatCard label="Tổng cuộc hẹn" value={overview?.tong_cuoc_hen} />
      </div>

      {/* 2 bảng cạnh nhau */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Luật sư theo thành phố */}
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="font-bold text-gray-800">Luật sư theo thành phố</h2>
          </div>
          {byCity.length === 0 ? (
            <p className="px-4 py-4 text-sm text-gray-400">Chưa có dữ liệu.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="px-4 py-2 font-medium">Thành phố</th>
                  <th className="px-4 py-2 font-medium text-right">
                    Số luật sư
                  </th>
                </tr>
              </thead>
              <tbody>
                {byCity.map((row, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="px-4 py-2 text-gray-700">{row.thanh_pho}</td>
                    <td className="px-4 py-2 text-right font-medium text-gray-800">
                      {row.so_luat_su}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Cuộc hẹn theo trạng thái */}
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="font-bold text-gray-800">
              Cuộc hẹn theo trạng thái
            </h2>
          </div>
          {Object.keys(byStatus).length === 0 ? (
            <p className="px-4 py-4 text-sm text-gray-400">Chưa có dữ liệu.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="px-4 py-2 font-medium">Trạng thái</th>
                  <th className="px-4 py-2 font-medium text-right">Số lượng</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(byStatus).map(([key, val]) => (
                  <tr key={key} className="border-t border-gray-100">
                    <td className="px-4 py-2 text-gray-700">
                      {STATUS_LABEL[key] || key}
                    </td>
                    <td className="px-4 py-2 text-right font-medium text-gray-800">
                      {val}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
