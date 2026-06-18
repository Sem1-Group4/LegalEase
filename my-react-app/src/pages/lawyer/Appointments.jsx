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

// Lấy chữ cái đầu của tên (cho ảnh placeholder khi khách chưa có avatar)
function initial(name) {
  return name ? name.trim().charAt(0).toUpperCase() : "?";
}

export default function LawyerAppointments() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("");
  const [selected, setSelected] = useState(null); // lịch hẹn đang xem chi tiết khách

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
  async function confirmAppt(id) {
    try {
      await api.patch(`/lawyer/appointments/${id}/confirm`);
      load();
    } catch (e) {
      alert(e?.response?.data?.message || "Không xác nhận được.");
    }
  }

  // Hoàn thành lịch: confirmed -> completed
  async function complete(id) {
    if (!window.confirm("Đánh dấu lịch này đã hoàn thành?")) return;
    try {
      await api.patch(`/lawyer/appointments/${id}/complete`);
      load();
    } catch (e) {
      alert(e?.response?.data?.message || "Không hoàn thành được.");
    }
  }

  // Hủy lịch
  async function cancel(id) {
    const reason = window.prompt("Lý do hủy (có thể bỏ trống):") ?? "";
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
        Xác nhận, hoàn thành hoặc hủy lịch hẹn của bạn. Bấm vào tên khách để xem
        chi tiết.
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
                    <button
                      onClick={() => setSelected(a)}
                      className="flex items-center gap-3 text-left hover:opacity-80"
                    >
                      {a.avatar ? (
                        <img
                          src={a.avatar}
                          alt={a.khach_hang}
                          className="h-9 w-9 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-bold text-white">
                          {initial(a.khach_hang)}
                        </span>
                      )}
                      <span>
                        <span className="block font-medium text-[var(--color-primary)] underline-offset-2 hover:underline">
                          {a.khach_hang}
                        </span>
                        {a.so_dien_thoai && (
                          <span className="block text-xs text-gray-400">
                            {a.so_dien_thoai}
                          </span>
                        )}
                      </span>
                    </button>
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
                          onClick={() => confirmAppt(a.id)}
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

      {/* Popup chi tiết khách hàng */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4">
              {selected.avatar ? (
                <img
                  src={selected.avatar}
                  alt={selected.khach_hang}
                  className="h-16 w-16 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)] text-xl font-bold text-white">
                  {initial(selected.khach_hang)}
                </span>
              )}
              <div>
                <p className="text-lg font-bold text-gray-800">
                  {selected.khach_hang}
                </p>
                <span
                  className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    STATUS_CLASS[selected.status] || "bg-gray-100 text-gray-500"
                  }`}
                >
                  {STATUS_LABEL[selected.status] || selected.status}
                </span>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <InfoRow label="Số điện thoại" value={selected.so_dien_thoai} />
              <InfoRow label="Email" value={selected.email} />
              <InfoRow label="Thành phố" value={selected.thanh_pho} />
              <InfoRow label="Địa chỉ" value={selected.dia_chi} />
              <InfoRow
                label="Lịch hẹn"
                value={`${selected.appointment_date} · ${selected.start_time} - ${selected.end_time}`}
              />
              <InfoRow
                label="Ghi chú của khách"
                value={selected.customer_note}
              />
              {selected.status === "cancelled" && (
                <InfoRow label="Lý do hủy" value={selected.cancel_reason} />
              )}
            </div>

            <button
              onClick={() => setSelected(null)}
              className="mt-6 w-full rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Một dòng thông tin trong popup (nhãn + giá trị)
function InfoRow({ label, value }) {
  return (
    <div className="flex gap-3">
      <span className="w-32 shrink-0 text-gray-500">{label}:</span>
      <span className="text-gray-800">{value || "—"}</span>
    </div>
  );
}
