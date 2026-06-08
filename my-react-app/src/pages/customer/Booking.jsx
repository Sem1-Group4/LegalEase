import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import EmptyState from '../../components/common/EmptyState'
import { getLawyerById, getAvailability } from '../../mock/data'

// Đặt lịch — chọn ngày + giờ theo slot trống của luật sư, rồi xác nhận.
export default function Booking() {
  const { lawyerId } = useParams()
  const lawyer = getLawyerById(lawyerId)
  const slotsByDate = getAvailability(lawyerId)

  const [selectedDate, setSelectedDate] = useState(slotsByDate[0]?.date || '')
  const [selectedTime, setSelectedTime] = useState('')
  const [note, setNote] = useState('')
  const [done, setDone] = useState(false)

  if (!lawyer) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState title="Không tìm thấy luật sư" icon="❓" />
        <div className="mt-6 text-center">
          <Link to="/tim-luat-su" className="text-[var(--color-primary)] hover:underline">← Tìm luật sư</Link>
        </div>
      </div>
    )
  }

  const daySlots = slotsByDate.find((d) => d.date === selectedDate)?.slots || []

  function handleConfirm() {
    if (!selectedDate || !selectedTime) return
    setDone(true)
  }

  // Màn hình xác nhận thành công.
  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="text-5xl">🎉</div>
          <h1 className="mt-4 text-xl font-bold text-[var(--color-primary)]">Đặt lịch thành công!</h1>
          <p className="mt-2 text-gray-600">
            Bạn đã đặt lịch với <span className="font-semibold">{lawyer.name}</span><br />
            vào <span className="font-semibold">{selectedDate}</span> lúc <span className="font-semibold">{selectedTime}</span>.
          </p>
          <p className="mt-2 text-sm text-gray-500">Luật sư sẽ xác nhận và liên hệ với bạn sớm.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/khach-hang/lich-hen" className="rounded-md bg-[var(--color-primary)] px-5 py-2 text-sm font-semibold text-white hover:brightness-110">
              Xem lịch hẹn
            </Link>
            <Link to="/tim-luat-su" className="rounded-md border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Tìm luật sư khác
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link to={`/luat-su/${lawyer.id}`} className="text-sm text-[var(--color-primary)] hover:underline">← Hồ sơ luật sư</Link>
      <h1 className="mt-3 text-2xl font-bold text-[var(--color-primary)]">Đặt lịch hẹn</h1>
      <p className="mt-1 text-gray-500">với <span className="font-semibold text-gray-700">{lawyer.name}</span> · {lawyer.specializations.join(', ')}</p>

      {slotsByDate.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="Luật sư chưa có khung giờ trống" description="Vui lòng quay lại sau hoặc chọn luật sư khác." icon="🕐" />
        </div>
      ) : (
        <div className="mt-6 space-y-6 rounded-xl border border-gray-200 bg-white p-6">
          {/* Chọn ngày */}
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">1. Chọn ngày</p>
            <div className="flex flex-wrap gap-2">
              {slotsByDate.map((d) => (
                <button
                  key={d.date}
                  onClick={() => { setSelectedDate(d.date); setSelectedTime('') }}
                  className={`rounded-md border px-4 py-2 text-sm font-medium ${
                    selectedDate === d.date
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {d.date}
                </button>
              ))}
            </div>
          </div>

          {/* Chọn giờ */}
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">2. Chọn giờ</p>
            <div className="flex flex-wrap gap-2">
              {daySlots.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTime(t)}
                  className={`rounded-md border px-4 py-2 text-sm font-medium ${
                    selectedTime === t
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-gray-900'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Ghi chú */}
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">3. Nội dung cần tư vấn (tùy chọn)</p>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Mô tả ngắn gọn vấn đề của bạn..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
            />
          </div>

          <button
            onClick={handleConfirm}
            disabled={!selectedDate || !selectedTime}
            className="w-full rounded-md bg-[var(--color-primary)] px-4 py-2.5 font-semibold text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Xác nhận đặt lịch
          </button>
        </div>
      )}
    </div>
  )
}
