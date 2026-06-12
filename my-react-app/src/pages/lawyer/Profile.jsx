import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function LawyerProfile() {
  const [profile, setProfile] = useState(null);
  const [cities, setCities] = useState([]);
  const [allSpecs, setAllSpecs] = useState([]);
  const [selectedSpecs, setSelectedSpecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // Các ô nhập
  const [cityId, setCityId] = useState("");
  const [license, setLicense] = useState("");
  const [experience, setExperience] = useState("");
  const [bio, setBio] = useState("");
  const [office, setOffice] = useState("");
  const [fee, setFee] = useState("");

  useEffect(() => {
    // Lấy hồ sơ + thành phố + lĩnh vực song song
    Promise.all([
      api.get("/lawyer/profile"),
      api.get("/cities").catch(() => ({ data: [] })),
      api.get("/specializations").catch(() => ({ data: [] })),
    ])
      .then(([resProfile, resCities, resSpecs]) => {
        const p = resProfile.data;
        setProfile(p);
        setCityId(p.city_id ?? "");
        setLicense(p.license_number ?? "");
        setExperience(p.experience_years ?? "");
        setBio(p.bio ?? "");
        setOffice(p.office_address ?? "");
        setFee(p.consultation_fee ?? "");
        setCities(resCities.data || []);
        setAllSpecs(resSpecs.data || []);
        setSelectedSpecs((p.specializations || []).map((s) => s.id));
      })
      .catch(() => setError("Không tải được hồ sơ."))
      .finally(() => setLoading(false));
  }, []);

  function toggleSpec(id) {
    setSelectedSpecs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function save() {
    setSaving(true);
    setMsg("");
    try {
      await api.put("/lawyer/profile", {
        city_id: cityId || null,
        license_number: license,
        experience_years: experience === "" ? null : Number(experience),
        bio,
        office_address: office,
        consultation_fee: fee === "" ? null : Number(fee),
        specialization_ids: selectedSpecs,
      });
      setMsg("Đã lưu hồ sơ.");
    } catch {
      setMsg("Lưu không thành công.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-gray-500">Đang tải…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800">Hồ sơ của tôi</h1>
      <p className="mt-1 text-gray-500">
        Cập nhật thông tin hiển thị cho khách hàng.
      </p>

      {/* Trạng thái duyệt */}
      <div className="mt-4 flex items-center gap-2">
        <span className="text-sm text-gray-600">Trạng thái:</span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            profile?.approval_status === "approved"
              ? "bg-green-100 text-green-700"
              : profile?.approval_status === "rejected"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {profile?.approval_status === "approved"
            ? "Đã duyệt"
            : profile?.approval_status === "rejected"
              ? "Bị từ chối"
              : "Chờ duyệt"}
        </span>
      </div>

      <div className="mt-6 space-y-4 rounded-xl border border-gray-200 bg-white p-6">
        {/* Thành phố */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Thành phố
          </label>
          {cities.length > 0 ? (
            <select
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="">— Chọn thành phố —</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              placeholder="ID thành phố"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          )}
        </div>

        {/* Số thẻ hành nghề */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Số thẻ hành nghề
          </label>
          <input
            value={license}
            onChange={(e) => setLicense(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>

        {/* Số năm kinh nghiệm */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Số năm kinh nghiệm
          </label>
          <input
            type="number"
            min="0"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>

        {/* Giới thiệu */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Giới thiệu bản thân
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>

        {/* Địa chỉ văn phòng */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Địa chỉ văn phòng
          </label>
          <input
            value={office}
            onChange={(e) => setOffice(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>

        {/* Phí tư vấn */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phí tư vấn (VNĐ)
          </label>
          <input
            type="number"
            min="0"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>

        {/* Chọn lĩnh vực hành nghề */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Lĩnh vực hành nghề
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {allSpecs.map((s) => {
              const active = selectedSpecs.includes(s.id);
              return (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => toggleSpec(s.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    active
                      ? "bg-[var(--color-primary)] text-white"
                      : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {s.name}
                </button>
              );
            })}
          </div>
          {allSpecs.length === 0 && (
            <p className="mt-1 text-xs text-gray-400">
              Chưa tải được danh sách lĩnh vực.
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-[var(--color-primary)] px-5 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
          >
            {saving ? "Đang lưu…" : "Lưu hồ sơ"}
          </button>
          {msg && <span className="text-sm text-gray-600">{msg}</span>}
        </div>
      </div>
    </div>
  );
}
