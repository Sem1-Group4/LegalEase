import { Link } from 'react-router-dom'

// Card hiển thị thông tin 1 luật sư (bố cục kiểu iLAW).
// Tái dùng ở trang chủ, trang tìm luật sư, trang chi tiết.
export default function LawyerCard({ lawyer }) {
  const {
    id,
    name,
    phone,
    city,
    rating_avg,
    reviews_count,
    specializations = [],
    experience_years,
    consultation_fee,
    avatar,
    is_verified,
    bio,
  } = lawyer

  const initial = name?.charAt(0)?.toUpperCase() ?? '?'
  const fee = consultation_fee
    ? new Intl.NumberFormat('vi-VN').format(consultation_fee) + 'đ'
    : null
  const filled = Math.round(Number(rating_avg) || 0)

  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      {/* Đầu card: ảnh + tên + sao */}
      <div className="flex gap-4 p-5">
        {avatar ? (
          <img src={avatar} alt={name} className="h-20 w-20 shrink-0 rounded-lg object-cover" />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)] text-3xl font-bold text-white">
            {initial}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="flex items-center gap-1.5 font-bold text-[var(--color-primary)]">
            <span className="truncate">{name}</span>
            {is_verified && <span title="Đã xác minh" className="text-blue-500">✓</span>}
          </h3>
          <div className="mt-1 text-sm">
            <span className="text-[var(--color-accent)]">
              {'★'.repeat(filled)}
              <span className="text-gray-300">{'★'.repeat(5 - filled)}</span>
            </span>{' '}
            <span className="text-gray-500">{reviews_count} nhận xét</span>
          </div>
          {experience_years > 0 && (
            <p className="mt-1 text-xs text-gray-500">
              {experience_years} năm kinh nghiệm{fee ? ` · ${fee}/buổi` : ''}
            </p>
          )}
        </div>
      </div>

      {/* Thân card: địa điểm, lĩnh vực, điện thoại */}
      <div className="space-y-1.5 border-t border-gray-100 px-5 py-4 text-sm">
        <p className="text-gray-600">
          <span className="font-semibold text-gray-500">📍 Địa điểm: </span>
          {city || '—'}
        </p>
        {specializations.length > 0 && (
          <p className="text-gray-600">
            <span className="font-semibold text-gray-500">Lĩnh vực hành nghề: </span>
            {specializations.join(', ')}
          </p>
        )}
        {phone && <p className="font-semibold text-[var(--color-primary)]">📞 {phone}</p>}
      </div>

      {/* Thông tin luật sư (trích bio) */}
      {bio && (
        <div className="border-t border-gray-100 px-5 py-4">
          <p className="text-sm font-semibold text-gray-700">Thông tin luật sư</p>
          <p className="mt-1 line-clamp-3 text-sm text-gray-500">{bio}</p>
        </div>
      )}

      {/* Nút xem chi tiết */}
      <div className="mt-auto p-5 pt-0">
        <Link
          to={`/luat-su/${id}`}
          className="block rounded-md bg-[var(--color-accent)] px-4 py-2 text-center text-sm font-semibold text-gray-900 hover:brightness-95"
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  )
}
