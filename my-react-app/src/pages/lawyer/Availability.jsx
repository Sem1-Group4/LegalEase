import { useEffect, useState } from "react";
import api from "../../api/axios";

// Cắt YYYY-MM-DD từ chuỗi ngày ISO.
function dateOnly(s) {
  return s ? s.slice(0, 10) : "";
}
// Cắt HH:MM từ chuỗi giờ.
function timeOnly(s) {
  return s ? s.slice(0, 5) : "";
}

export default function LawyerAvailability() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  // Form thêm mới
  const [type, setType] = useState("specific"); // specific | recurring
  const [date, setDate] = useState("");
  const [repeatFrom, setRepeatFrom] = useState("");
  const [repeatTo, setRepeatTo] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("17:00");

  function load() {
    setLoading(true);
    api
      .get("/lawyer/availabilities")
      .then((res) => setList(res.data))
      .catch(() => setError("Không tải được khung giờ."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function add() {
    setMsg("");
    // Kiểm tra cơ bản
    if (type === "specific" && !date) {
      setMsg("Vui lòng chọn ngày.");
      return;
    }
    if (type === "recurring" && (!repeatFrom || !repeatTo)) {
      setMsg("Vui lòng chọn khoảng ngày lặp.");
      return;
    }
    if (!startTime || !endTime || startTime >= endTime) {
      setMsg("Giờ kết thúc phải sau giờ bắt đầu.");
      return;
    }

    setSaving(true);
    const payload = {
      type,
      start_time: startTime,
      end_time: endTime,
    };
    if (type === "specific") {
      payload.available_date = date;
    } else {
      payload.repeat_from = repeatFrom;
      payload.repeat_to = repeatTo;
    }

    try {
      await api.post("/lawyer/availabilities", payload);
      setMsg("Đã thêm khung giờ.");
      // reset nhẹ
      setDate("");
      setRepeatFrom("");
      setRepeatTo("");
      load();
    } catch (e) {
      setMsg(e?.response?.data?.message || "Thêm không thành công.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!confirm("Xóa khung giờ này?")) return;
    try {
      await api.delete(`/lawyer/availabilities/${id}`);
      load();
    } catch (e) {
      alert(e?.response?.data?.message || "Xóa không thành công.");
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-800">Khung giờ rảnh</h1>
      <p className="mt-1 text-gray-500">
        Tạo các khung giờ bạn rảnh để khách hàng đặt lịch.
      </p>

      {/* Form thêm */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="font-bold text-gray-800">Thêm khung giờ</h2>

        {/* Chọn loại */}
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => setType("specific")}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              type === "specific"
                ? "bg-[var(--color-primary)] text-white"
                : "border border-gray-300 text-gray-600"
            }`}
          >
            Một ngày cụ thể
          </button>
          <button
            onClick={() => setType("recurring")}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              type === "recurring"
                ? "bg-[var(--color-primary)] text-white"
                : "border border-gray-300 text-gray-600"
            }`}
          >
            Lặp lại hằng ngày
          </button>
        </div>

        {/* Ngày / khoảng ngày */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {type === "specific" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ngày
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Từ ngày
                </label>
                <input
                  type="date"
                  value={repeatFrom}
                  onChange={(e) => setRepeatFrom(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Đến ngày
                </label>
                <input
                  type="date"
                  value={repeatTo}
                  onChange={(e) => setRepeatTo(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </>
          )}
        </div>

        {/* Giờ */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Giờ bắt đầu
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Giờ kết thúc
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={add}
            disabled={saving}
            className="rounded-lg bg-[var(--color-accent)] px-5 py-2 text-sm font-semibold text-gray-900 hover:brightness-95 disabled:opacity-60"
          >
            {saving ? "Đang thêm…" : "+ Thêm khung giờ"}
          </button>
          {msg && <span className="text-sm text-gray-600">{msg}</span>}
        </div>
      </div>

      {/* Danh sách */}
      {loading ? (
        <p className="mt-6 text-gray-500">Đang tải…</p>
      ) : error ? (
        <p className="mt-6 text-red-600">{error}</p>
      ) : list.length === 0 ? (
        <p className="mt-6 text-gray-400">Chưa có khung giờ nào.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Loại</th>
                <th className="px-4 py-3 font-medium">Ngày / Khoảng lặp</th>
                <th className="px-4 py-3 font-medium">Giờ</th>
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
                    {a.available_date ? "Ngày cụ thể" : "Lặp lại"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {a.available_date
                      ? dateOnly(a.available_date)
                      : `${dateOnly(a.repeat_from)} → ${dateOnly(a.repeat_to)}`}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {timeOnly(a.start_time)} - {timeOnly(a.end_time)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => remove(a.id)}
                      className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
                    >
                      Xóa
                    </button>
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
