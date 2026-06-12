import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../api/axios'
import EmptyState from '../../components/common/EmptyState'

// Số block (tiếng) tối đa khách được chọn liên tiếp trong 1 lần đặt.
const MAX_BLOCKS = 3

// Hôm nay theo định dạng YYYY-MM-DD (dùng làm min cho input ngày).
function todayStr() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

// Đặt lịch — chọn ngày, xem slot trống thật của luật sư, rồi xác nhận (gọi API).
export default function Booking() {
  const { lawyerId } = useParams()

  const [lawyer, setLawyer] = useState(null)
  const [loadingLawyer, setLoadingLawyer] = useState(true)

  const [selectedDate, setSelectedDate] = useState(todayStr())
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  // Các block giờ đang chọn — luôn LIÊN TIẾP và sắp theo thứ tự thời gian.
  const [selected, setSelected] = useState([])
  const [note, setNote] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  // Tải thông tin luật sư.
  useEffect(() => {
    setLoadingLawyer(true)
    api
      .get(`/lawyers/${lawyerId}`)
      .then((res) => setLawyer(res.data))
      .catch(() => setLawyer(null))
      .finally(() => setLoadingLawyer(false))
  }, [lawyerId])

  // Tải slot trống mỗi khi đổi ngày.
  useEffect(() => {
    if (!selectedDate) return
    setLoadingSlots(true)
    setSelected([])
    api
      .get(`/lawyers/${lawyerId}/slots`, { params: { date: selectedDate } })
      .then((res) => setSlots(res.data.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false))
  }, [lawyerId, selectedDate])

  // Khoảng giờ đang chọn (giờ bắt đầu của block đầu → giờ kết thúc của block cuối).
  const range = selected.length
    ? { start: selected[0].start, end: selected[selected.length - 1].end }
    : null

  const isSelected = (s) => selected.some((x) => x.start === s.start)

  // Bấm 1 block: giữ tập chọn luôn LIÊN TIẾP và tối đa MAX_BLOCKS.
  function toggleSlot(s) {
    setError('')
    const prev = selected
    if (prev.length === 0) return setSelected([s])

    const first = prev[0]
    const last = prev[prev.length - 1]

    if (s.start === first.start) return setSelected(prev.slice(1))       // bỏ block đầu
    if (s.start === last.start) return setSelected(prev.slice(0, -1))    // bỏ block cuối

    if (s.start === last.end) {                                          // nối vào cuối
      if (prev.length >= MAX_BLOCKS) return setError(`Chỉ được chọn tối đa ${MAX_BLOCKS} tiếng liên tiếp.`)
      return setSelected([...prev, s])
    }
    if (s.end === first.start) {                                         // nối vào đầu
      if (prev.length >= MAX_BLOCKS) return setError(`Chỉ được chọn tối đa ${MAX_BLOCKS} tiếng liên tiếp.`)
      return setSelected([s, ...prev])
    }

    return setSelected([s])                                              // bấm chỗ khác -> chọn lại từ đầu
  }

  async function handleConfirm() {
    if (!selectedDate || !range) return
    setSubmitting(true)
    setError('')
    try {
      await api.post('/customer/appointments', {
        lawyer_profile_id: Number(lawyerId),
        appointment_date: selectedDate,
        start_time: range.start,
        end_time: range.end,
        customer_note: note || null,
      })
      setDone(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Đặt lịch không thành công. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingLawyer) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-gray-500">Đang tải…</div>
  }

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

  // Màn hình xác nhận thành công.
  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="text-5xl">🎉</div>
          <h1 className="mt-4 text-xl font-bold text-[var(--color-primary)]">Đặt lịch thành công!</h1>
          <p className="mt-2 text-gray-600">
            Bạn đã đặt lịch với <span className="font-semibold">{lawyer.name}</span><br />
            vào <span className="font-semibold">{selectedDate}</span>
            {range && <> lúc <span className="font-semibold">{range.start} – {range.end}</span></>}.
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
      <p className="mt-1 text-gray-500">
        với <span className="font-semibold text-gray-700">{lawyer.name}</span>
        {lawyer.specializations?.length ? ` · ${lawyer.specializations.join(', ')}` : ''}
      </p>

      <div className="mt-6 space-y-6 rounded-xl border border-gray-200 bg-white p-6">
        {/* Chọn ngày */}
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">1. Chọn ngày</p>
          <input
            type="date"
            min={todayStr()}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-[var(--color-primary)] focus:outline-none"
          />
        </div>

        {/* Chọn giờ */}
        <div>
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <p className="text-sm font-medium text-gray-700">2. Chọn giờ</p>
            <span className="text-xs text-gray-400">Chọn 1–{MAX_BLOCKS} khung giờ liên tiếp</span>
          </div>
          {loadingSlots ? (
            <p className="text-sm text-gray-400">Đang tải khung giờ…</p>
          ) : slots.length === 0 ? (
            <p className="text-sm text-gray-400">Ngày này luật sư không có khung giờ trống. Hãy chọn ngày khác.</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {slots.map((s) => (
                  <button
                    key={s.start}
                    onClick={() => toggleSlot(s)}
                    className={`rounded-md border px-4 py-2 text-sm font-medium ${
                      isSelected(s)
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-gray-900'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {s.start}
                  </button>
                ))}
              </div>
              {range && (
                <p className="mt-3 text-sm text-gray-600">
                  Đã chọn: <span className="font-semibold text-gray-800">{range.start} – {range.end}</span>{' '}
                  ({selected.length} tiếng)
                </p>
              )}
            </>
          )}
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

        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <button
          onClick={handleConfirm}
          disabled={!selectedDate || !range || submitting}
          className="w-full rounded-md bg-[var(--color-primary)] px-4 py-2.5 font-semibold text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting
            ? 'Đang đặt lịch…'
            : range
              ? `Xác nhận đặt lịch ${range.start} – ${range.end}`
              : 'Xác nhận đặt lịch'}
        </button>
      </div>
    </div>
  )
}
