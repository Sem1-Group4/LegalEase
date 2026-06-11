import { useEffect, useState } from "react";
import api from "../../api/axios";
import StatusBadge from "../../components/common/StatusBadge";

export default function AppointmentMonitor() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState(""); // '', pending, confirmed, completed, cancelled

  // Tải danh sách lịch hẹn toàn hệ thống (lọc theo trạng thái nếu có).
  function load() {
    setLoading(true);
    const url = status
      ? `/admin/appointments?status=${status}`
      : "/admin/appointments";
    api
      .get(url)
      .then((res) => setAppointments(res.data))
      .catch(() => setError("Không tải được danh sách lịch hẹn."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Admin hủy lịch hẹn (có hỏi lý do).
  async function cancel(id) {
    const reason = prompt(
      "Lý do hủy (có thể để trống):",
      "Hủy bởi quản trị viên.",
    );
    if (reason === null) return; // người dùng bấm Cancel
    try {
      await api.patch(`/admin/appointments/${id}/cancel`, {
        cancel_reason: reason,
      });
      load();
    } catch (err) {
      const msg = err.response?.data?.message || "Hủy không thành công.";
      alert(msg);
    }
  }

  const TABS = [
    { key: "", label: "Tất cả" },
    { key: "pending", label: "Chờ xác nhận" },
    { key: "confirmed", label: "Đã xác nhận" },
    { key: "completed", label: "Hoàn tất" },
    { key: "cancelled", label: "Đã hủy" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800">Giám sát lịch hẹn</h1>
      <p className="mt-1 text-gray-500">
        Theo dõi và hủy lịch hẹn toàn hệ thống.
      </p>

      {/* Bộ lọc trạng thái */}
      <div className="mt-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setStatus(t.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              status === t.key
                ? "bg-[var(--color-primary)] text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Nội dung */}
      {loading ? (
        <p className="mt-6 text-gray-500">Đang tải…</p>
      ) : error ? (
        <p className="mt-6 text-red-600">{error}</p>
      ) : appointments.length === 0 ? (
        <p className="mt-6 text-gray-400">Không có lịch hẹn nào.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Khách hàng</th>
                <th className="px-4 py-3 font-medium">Luật sư</th>
                <th className="px-4 py-3 font-medium">Ngày</th>
                <th className="px-4 py-3 font-medium">Giờ</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {a.khach_hang || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {a.luat_su || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {a.appointment_date}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {a.start_time} - {a.end_time}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {a.status !== "completed" && a.status !== "cancelled" ? (
                      <button
                        onClick={() => cancel(a.id)}
                        className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
                      >
                        Hủy lịch
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
