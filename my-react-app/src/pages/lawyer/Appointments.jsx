import { useEffect, useState } from "react";
import api from "../../api/axios";

const TABS = [
  { key: "", label: "Tất cả" },
  { key: "pending", label: "Chờ xác nhận" },
  { key: "confirmed", label: "Đã xác nhận" },
  { key: "completed", label: "Hoàn tất" },
  { key: "cancelled", label: "Đã hủy" },
];

const STATUS_LABEL = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
};

const STATUS_CLASS = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-500",
};

export default function LawyerAppointments() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("");

  function load(status = tab) {
    setLoading(true);
    const url = status
      ? `/lawyer/appointments?status=${status}`
      : "/lawyer/appointments";
    api
      .get(url)
      .then((res) => setList(res.data))
      .catch(() => setError("Không tải được lịch hẹn."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load(tab);
  }, [tab]);

  // Xác nhận lịch: pending -> confirmed
  async function confirm(id) {
    try {
      await api.patch(`/lawyer/appointments/${id}/confirm`);
      load();
    } catch (e) {
      alert(e?.response?.data?.message || "Không xác nhận được.");
    }
  }

  // Hoàn thành lịch: confirmed -> completed
  async function complete(id) {
    if (!confirm("Đánh dấu lịch này đã hoàn thành?")) return;
    try {
      await api.patch(`/lawyer/appointments/${id}/complete`);
      load();
    } catch (e) {
      alert(e?.response?.data?.message || "Không hoàn thành được.");
    }
  }

  // Hủy lịch
  async function cancel(id) {
    const reason = prompt("Lý do hủy (có thể bỏ trống):") ?? "";
    try {
      await api.patch(`/lawyer/appointments/${id}/cancel`, {
        cancel_reason: reason,
      });
      load();
    } catch (e) {
      alert(e?.response?.data?.message || "Không hủy được.");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800">Lịch hẹn</h1>
      <p className="mt-1 text-gray-500">
        Xác nhận, hoàn thành hoặc hủy lịch hẹn của bạn.
      </p>

      {/* Tabs lọc */}
      <div className="mt-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              tab === t.key
                ? "bg-[var(--color-primary)] text-white"
                : "border border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-6 text-gray-500">Đang tải…</p>
      ) : error ? (
        <p className="mt-6 text-red-600">{error}</p>
      ) : list.length === 0 ? (
        <p className="mt-6 text-gray-400">Không có lịch hẹn nào.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Khách hàng</th>
                <th className="px-4 py-3 font-medium">Ngày</th>
                <th className="px-4 py-3 font-medium">Giờ</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {list.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{a.khach_hang}</p>
                    {a.so_dien_thoai && (
                      <p className="text-xs text-gray-400">{a.so_dien_thoai}</p>
                    )}
                    {a.customer_note && (
                      <p className="mt-1 text-xs text-gray-500">
                        Ghi chú: {a.customer_note}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {a.appointment_date}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {a.start_time} - {a.end_time}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        STATUS_CLASS[a.status] || "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {STATUS_LABEL[a.status] || a.status}
                    </span>
                    {a.status === "cancelled" && a.cancel_reason && (
                      <p className="mt-1 text-xs text-gray-400">
                        Lý do: {a.cancel_reason}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {a.status === "pending" && (
                        <button
                          onClick={() => confirm(a.id)}
                          className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                        >
                          Xác nhận
                        </button>
                      )}
                      {a.status === "confirmed" && (
                        <button
                          onClick={() => complete(a.id)}
                          className="rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
                        >
                          Hoàn thành
                        </button>
                      )}
                      {(a.status === "pending" || a.status === "confirmed") && (
                        <button
                          onClick={() => cancel(a.id)}
                          className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          Hủy
                        </button>
                      )}
                      {(a.status === "completed" ||
                        a.status === "cancelled") && (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </div>
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
