import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function SpecializationManage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  // Form thêm mới
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [adding, setAdding] = useState(false);

  // Đang sửa dòng nào (id), và giá trị đang sửa
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  function load() {
    setLoading(true);
    api
      .get("/admin/specializations")
      .then((res) => setList(res.data))
      .catch(() => setError("Không tải được danh sách lĩnh vực."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function add() {
    setMsg("");
    if (!newName.trim()) {
      setMsg("Vui lòng nhập tên lĩnh vực.");
      return;
    }
    setAdding(true);
    try {
      await api.post("/admin/specializations", {
        name: newName.trim(),
        description: newDesc.trim() || null,
      });
      setMsg("Đã thêm lĩnh vực.");
      setNewName("");
      setNewDesc("");
      load();
    } catch (e) {
      setMsg(e?.response?.data?.message || "Thêm không thành công.");
    } finally {
      setAdding(false);
    }
  }

  function startEdit(s) {
    setEditId(s.id);
    setEditName(s.name);
    setEditDesc(s.description || "");
    setMsg("");
  }

  function cancelEdit() {
    setEditId(null);
    setEditName("");
    setEditDesc("");
  }

  async function saveEdit(id) {
    if (!editName.trim()) {
      setMsg("Tên lĩnh vực không được trống.");
      return;
    }
    try {
      await api.put(`/admin/specializations/${id}`, {
        name: editName.trim(),
        description: editDesc.trim() || null,
      });
      setMsg("Đã cập nhật lĩnh vực.");
      cancelEdit();
      load();
    } catch (e) {
      setMsg(e?.response?.data?.message || "Cập nhật không thành công.");
    }
  }

  async function remove(s) {
    if (!confirm(`Xóa lĩnh vực "${s.name}"?`)) return;
    try {
      await api.delete(`/admin/specializations/${s.id}`);
      setMsg("Đã xóa lĩnh vực.");
      load();
    } catch (e) {
      setMsg(e?.response?.data?.message || "Xóa không thành công.");
    }
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-800">Lĩnh vực hành nghề</h1>
      <p className="mt-1 text-gray-500">
        Quản lý danh mục lĩnh vực chuyên môn cho luật sư.
      </p>

      {/* Form thêm */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="font-bold text-gray-800">Thêm lĩnh vực mới</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tên lĩnh vực
            </label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="VD: Sở hữu trí tuệ"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mô tả (tùy chọn)
            </label>
            <input
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Mô tả ngắn"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={add}
            disabled={adding}
            className="rounded-lg bg-[var(--color-accent)] px-5 py-2 text-sm font-semibold text-gray-900 hover:brightness-95 disabled:opacity-60"
          >
            {adding ? "Đang thêm…" : "+ Thêm lĩnh vực"}
          </button>
          {msg && <span className="text-sm text-gray-600">{msg}</span>}
        </div>
      </div>

      {/* Danh sách */}
      {loading ? (
        <p className="mt-6 text-gray-500">Đang tải…</p>
      ) : error ? (
        <p className="mt-6 text-red-600">{error}</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Tên lĩnh vực</th>
                <th className="px-4 py-3 font-medium">Mô tả</th>
                <th className="px-4 py-3 font-medium text-center">
                  Số luật sư
                </th>
                <th className="px-4 py-3 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-gray-100 last:border-0"
                >
                  {editId === s.id ? (
                    <>
                      <td className="px-4 py-3">
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 text-center text-gray-500">
                        {s.lawyer_profiles_count}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => saveEdit(s.id)}
                          className="rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
                        >
                          Lưu
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="ml-2 rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                        >
                          Hủy
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {s.name}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {s.description || "—"}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-700">
                        {s.lawyer_profiles_count}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => startEdit(s)}
                          className="rounded-md bg-[var(--color-primary)] px-3 py-1 text-xs font-medium text-white hover:brightness-110"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => remove(s)}
                          className="ml-2 rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
                        >
                          Xóa
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-gray-400"
                  >
                    Chưa có lĩnh vực nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
