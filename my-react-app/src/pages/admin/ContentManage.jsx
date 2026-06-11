import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function ContentManage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form thêm/sửa (inline). editingId = null => đang thêm mới.
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    api
      .get("/admin/announcements")
      .then((res) => setNews(res.data))
      .catch(() => setError("Không tải được danh sách tin tức."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  // Mở form thêm mới (xóa trắng các ô).
  function openCreate() {
    setEditingId(null);
    setTitle("");
    setContent("");
    setIsPublished(true);
    setShowForm(true);
  }

  // Mở form sửa (đổ dữ liệu tin cũ vào ô).
  async function openEdit(item) {
    setEditingId(item.id);
    setShowForm(true);
    // Hiện tạm tiêu đề đã biết, nội dung để trống trong lúc tải
    setTitle(item.title || "");
    setContent("");
    setIsPublished(item.is_published ?? true);

    try {
      const res = await api.get(`/admin/announcements/${item.id}`);
      const data = res.data;
      setTitle(data.title || "");
      setContent(data.content || "");
      setIsPublished(data.is_published ?? true);
    } catch {
      alert("Không tải được nội dung tin. Thử lại.");
    }
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
  }

  // Lưu: nếu có editingId thì PUT (sửa), không thì POST (thêm).
  async function save() {
    if (!title.trim()) {
      alert("Vui lòng nhập tiêu đề.");
      return;
    }
    setSaving(true);
    const payload = { title, content, is_published: isPublished };
    try {
      if (editingId) {
        await api.put(`/admin/announcements/${editingId}`, payload);
      } else {
        await api.post("/admin/announcements", payload);
      }
      closeForm();
      load();
    } catch {
      alert("Lưu không thành công.");
    } finally {
      setSaving(false);
    }
  }

  // Xóa tin (có xác nhận).
  async function remove(id, t) {
    if (!confirm(`Xóa tin "${t}"?`)) return;
    try {
      await api.delete(`/admin/announcements/${id}`);
      load();
    } catch {
      alert("Xóa không thành công.");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý nội dung</h1>
          <p className="mt-1 text-gray-500">
            Thêm, sửa, xóa tin tức / thông báo.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={openCreate}
            className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-gray-900 hover:brightness-95"
          >
            + Thêm tin mới
          </button>
        )}
      </div>

      {/* Form thêm/sửa (inline) */}
      {showForm && (
        <div className="mt-5 rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="font-bold text-gray-800">
            {editingId ? "Sửa tin" : "Thêm tin mới"}
          </h2>

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tiêu đề
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="Tiêu đề tin tức…"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nội dung
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="Nội dung chi tiết…"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
              Đăng công khai (hiển thị cho người dùng)
            </label>
          </div>

          <div className="mt-5 flex gap-2">
            <button
              onClick={save}
              disabled={saving}
              className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
            >
              {saving ? "Đang lưu…" : "Lưu"}
            </button>
            <button
              onClick={closeForm}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Danh sách tin */}
      {loading ? (
        <p className="mt-6 text-gray-500">Đang tải…</p>
      ) : error ? (
        <p className="mt-6 text-red-600">{error}</p>
      ) : news.length === 0 ? (
        <p className="mt-6 text-gray-400">Chưa có tin nào.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Tiêu đề</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {news.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {item.title}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium ${
                        item.is_published ? "text-green-600" : "text-gray-400"
                      }`}
                    >
                      {item.is_published ? "Đã đăng" : "Bản nháp"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(item)}
                        className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => remove(item.id, item.title)}
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
