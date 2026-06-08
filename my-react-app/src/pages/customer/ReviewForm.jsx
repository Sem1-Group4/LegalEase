import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import StarRating from '../../components/common/StarRating'
import EmptyState from '../../components/common/EmptyState'
import { myAppointments } from '../../mock/data'

// Đánh giá luật sư — gửi số sao + nhận xét sau buổi tư vấn (chỉ khi đã hoàn tất).
export default function ReviewForm() {
  const { appointmentId } = useParams()
  const navigate = useNavigate()
  const appointment = myAppointments.find((a) => String(a.id) === String(appointmentId))

  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [done, setDone] = useState(false)

  if (!appointment || appointment.status !== 'completed') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          title="Chưa thể đánh giá"
          description="Chỉ có thể đánh giá sau khi buổi tư vấn đã hoàn tất."
          icon="⭐"
        />
        <div className="mt-6 text-center">
          <Link to="/khach-hang/lich-hen" className="text-[var(--color-primary)] hover:underline">← Lịch hẹn của tôi</Link>
        </div>
      </div>
    )
  }

  function handleSubmit(e) {
    e.preventDefault()
    setDone(true)
    setTimeout(() => navigate('/khach-hang/lich-hen'), 1500)
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-center text-2xl font-bold text-[var(--color-primary)]">Đánh giá luật sư</h1>
        <p className="mt-1 text-center text-sm text-gray-500">
          {appointment.lawyer_name} · buổi tư vấn ngày {appointment.date}
        </p>

        {done ? (
          <p className="mt-6 rounded-md bg-green-50 px-3 py-4 text-center text-sm text-green-700">
            🎉 Cảm ơn bạn đã gửi đánh giá! Đang chuyển về trang lịch hẹn...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="text-center">
              <p className="mb-2 text-sm font-medium text-gray-700">Mức độ hài lòng của bạn</p>
              <StarRating value={rating} onChange={setRating} size="text-4xl" />
            </div>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Nhận xét</span>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn về buổi tư vấn..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-md bg-[var(--color-primary)] px-4 py-2.5 font-semibold text-white hover:brightness-110"
            >
              Gửi đánh giá
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
