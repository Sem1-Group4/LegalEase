import { useParams, Link } from 'react-router-dom'
import StarRating from '../../components/common/StarRating'
import EmptyState from '../../components/common/EmptyState'
import { getLawyerById, getReviewsByLawyer, getAvailability } from '../../mock/data'

// Chi tiết hồ sơ luật sư — thông tin, lĩnh vực, đánh giá, lịch trống, nút đặt lịch.
export default function LawyerDetail() {
  const { id } = useParams()
  const lawyer = getLawyerById(id)

  if (!lawyer) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState title="Không tìm thấy luật sư" description="Hồ sơ bạn tìm không tồn tại." icon="❓" />
        <div className="mt-6 text-center">
          <Link to="/tim-luat-su" className="text-[var(--color-primary)] hover:underline">← Quay lại danh sách</Link>
        </div>
      </div>
    )
  }

  const reviews = getReviewsByLawyer(id)
  const slots = getAvailability(id)
  const initial = lawyer.name?.charAt(0)?.toUpperCase() ?? '?'
  const fee = lawyer.consultation_fee
    ? new Intl.NumberFormat('vi-VN').format(lawyer.consultation_fee) + 'đ'
    : '—'

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link to="/tim-luat-su" className="text-sm text-[var(--color-primary)] hover:underline">← Danh sách luật sư</Link>

      {/* Đầu trang: ảnh + thông tin chính */}
      <div className="mt-4 flex flex-col gap-6 rounded-xl border border-gray-200 bg-white p-6 sm:flex-row">
        <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)] text-5xl font-bold text-white">
          {initial}
        </div>
        <div className="flex-1">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--color-primary)]">
            {lawyer.name}
            {lawyer.is_verified && <span title="Đã xác minh" className="text-blue-500">✓</span>}
          </h1>
          <div className="mt-1 flex items-center gap-2 text-sm">
            <StarRating value={lawyer.rating_avg} />
            <span className="text-gray-500">{lawyer.rating_avg} · {lawyer.reviews_count} nhận xét</span>
          </div>
          <div className="mt-3 grid gap-1 text-sm text-gray-600 sm:grid-cols-2">
            <p>📍 {lawyer.city}</p>
            <p>📞 {lawyer.phone}</p>
            <p>💼 {lawyer.experience_years} năm kinh nghiệm</p>
            <p>💰 Phí tư vấn: <span className="font-semibold text-[var(--color-primary)]">{fee}/buổi</span></p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {lawyer.specializations.map((s) => (
              <span key={s} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-[var(--color-primary)]">
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="sm:self-center">
          <Link
            to={`/khach-hang/dat-lich/${lawyer.id}`}
            className="block rounded-md bg-[var(--color-accent)] px-6 py-3 text-center font-semibold text-gray-900 hover:brightness-95"
          >
            Đặt lịch hẹn
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Cột trái: giới thiệu + đánh giá */}
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="font-bold text-gray-800">Giới thiệu</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{lawyer.bio}</p>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="font-bold text-gray-800">Đánh giá từ khách hàng ({reviews.length})</h2>
            {reviews.length === 0 ? (
              <p className="mt-3 text-sm text-gray-400">Chưa có đánh giá nào.</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {reviews.map((r) => (
                  <li key={r.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">{r.customer_name}</span>
                      <span className="text-xs text-gray-400">{r.created_at}</span>
                    </div>
                    <StarRating value={r.rating} size="text-sm" />
                    <p className="mt-1 text-sm text-gray-600">{r.comment}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Cột phải: lịch trống */}
        <aside className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="font-bold text-gray-800">Lịch trống gần nhất</h2>
          {slots.length === 0 ? (
            <p className="mt-3 text-sm text-gray-400">Hiện chưa có khung giờ trống.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {slots.map((d) => (
                <div key={d.date}>
                  <p className="text-sm font-medium text-gray-700">{d.date}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {d.slots.map((t) => (
                      <span key={t} className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-600">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link
            to={`/khach-hang/dat-lich/${lawyer.id}`}
            className="mt-4 block rounded-md border border-[var(--color-primary)] px-4 py-2 text-center text-sm font-semibold text-[var(--color-primary)] hover:bg-blue-50"
          >
            Chọn giờ & đặt lịch
          </Link>
        </aside>
      </div>
    </div>
  )
}
