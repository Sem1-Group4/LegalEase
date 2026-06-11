import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function CustomerManage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(""); // '', active, inactive

  // Tải danh sách khách hàng (kèm tìm kiếm + lọc trạng thái).
  function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (status) params.append("status", status);
    const qs = params.toString();
    api
      .get(`/admin/customers${qs ? "?" + qs : ""}`)
      .then((res) => setCustomers(res.data))
      .catch(() => setError("Không tải được danh sách khách hàng."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Khóa / mở khóa tài khoản khách hàng.
  async function toggleActive(id) {
    try {
      await api.patch(`/admin/customers/${id}/toggle-active`);
      load();
    } catch {
      alert("Thao tác không thành công.");
    }
  }

  // Xóa khách hàng (có xác nhận).
  async function remove(id, name) {
    if (!confirm(`Xóa khách hàng "${name}"? Hành động này không thể hoàn tác.`))
      return;
    try {
      await api.delete(`/admin/customers/${id}`);
      load();
    } catch {
      alert("Xóa không thành công.");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800">Quản lý khách hàng</h1>
      <p className="mt-1 text-gray-500">
        Xem, khóa hoặc xóa tài khoản khách hàng.
      </p>

      {/* Thanh tìm kiếm + lọc */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          placeholder="Tìm theo tên hoặc email…"
          className="flex-1 min-w-[220px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />
        <button
          onClick={load}
          className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:brightness-110"
        >
          Tìm
        </button>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Đã khóa</option>
        </select>
      </div>

      {/* Nội dung */}
      {loading ? (
        <p className="mt-6 text-gray-500">Đang tải…</p>
      ) : error ? (
        <p className="mt-6 text-red-600">{error}</p>
      ) : customers.length === 0 ? (
        <p className="mt-6 text-gray-400">Không có khách hàng nào.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Họ tên</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">SĐT</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {c.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.email}</td>
                  <td className="px-4 py-3 text-gray-600">{c.phone || "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium ${
                        c.status === "active"
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      {c.status === "active" ? "Đang hoạt động" : "Đã khóa"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => toggleActive(c.id)}
                        className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                      >
                        {c.status === "active" ? "Khóa" : "Mở khóa"}
                      </button>
                      <button
                        onClick={() => remove(c.id, c.name)}
                        className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
                      >
                        Xóa
                      </button>
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
