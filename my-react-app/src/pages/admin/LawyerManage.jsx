import { useEffect, useState } from "react";
import api from "../../api/axios";

// Nhãn trạng thái duyệt hồ sơ luật sư (riêng cho khu admin).
function ApprovalBadge({ status }) {
  const MAP = {
    pending: { label: "Chờ duyệt", cls: "bg-yellow-100 text-yellow-800" },
    approved: { label: "Đã duyệt", cls: "bg-green-100 text-green-800" },
    rejected: { label: "Từ chối", cls: "bg-red-100 text-red-700" },
  };
  const item = MAP[status] || {
    label: status,
    cls: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${item.cls}`}
    >
      {item.label}
    </span>
  );
}

export default function LawyerManage() {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState(""); // '', pending, approved, rejected

  // Tải danh sách luật sư (lọc theo trạng thái nếu có).
  function load() {
    setLoading(true);
    const url = filter ? `/admin/lawyers?status=${filter}` : "/admin/lawyers";
    api
      .get(url)
      .then((res) => setLawyers(res.data))
      .catch(() => setError("Không tải được danh sách luật sư."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // Gọi hành động (duyệt / từ chối / khóa-mở) rồi tải lại danh sách.
  async function doAction(id, action) {
    try {
      await api.patch(`/admin/lawyers/${id}/${action}`);
      load();
    } catch {
      alert("Thao tác không thành công. Thử lại.");
    }
  }

  const TABS = [
    { key: "", label: "Tất cả" },
    { key: "pending", label: "Chờ duyệt" },
    { key: "approved", label: "Đã duyệt" },
    { key: "rejected", label: "Từ chối" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800">Quản lý luật sư</h1>
      <p className="mt-1 text-gray-500">
        Duyệt hồ sơ, vô hiệu hóa tài khoản luật sư.
      </p>

      {/* Bộ lọc trạng thái */}
      <div className="mt-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filter === t.key
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
      ) : lawyers.length === 0 ? (
        <p className="mt-6 text-gray-400">Không có luật sư nào.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Họ tên</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Thành phố</th>
                <th className="px-4 py-3 font-medium">KN</th>
                <th className="px-4 py-3 font-medium">Duyệt</th>
                <th className="px-4 py-3 font-medium">Tài khoản</th>
                <th className="px-4 py-3 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {lawyers.map((lw) => (
                <tr
                  key={lw.id}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {lw.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{lw.email}</td>
                  <td className="px-4 py-3 text-gray-600">{lw.city || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {lw.experience_years} năm
                  </td>
                  <td className="px-4 py-3">
                    <ApprovalBadge status={lw.approval_status} />
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium ${
                        lw.account_status === "active"
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      {lw.account_status === "active"
                        ? "Đang hoạt động"
                        : "Đã khóa"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {lw.approval_status === "pending" && (
                        <>
                          <button
                            onClick={() => doAction(lw.id, "approve")}
                            className="rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => doAction(lw.id, "reject")}
                            className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
                          >
                            Từ chối
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => doAction(lw.id, "toggle-active")}
                        className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                      >
                        {lw.account_status === "active" ? "Khóa" : "Mở khóa"}
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
