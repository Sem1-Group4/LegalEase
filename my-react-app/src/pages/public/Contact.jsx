import { useState } from 'react'
import Field from '../../components/common/Field'

// Liên hệ — thông tin liên hệ + form gửi tin nhắn (mock).
export default function Contact() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setSent(true)
    setForm({ name: '', email: '', message: '' })
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-[var(--color-primary)]">Liên hệ</h1>
      <p className="mt-1 text-gray-500">Chúng tôi luôn sẵn sàng hỗ trợ bạn.</p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        {/* Thông tin liên hệ */}
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="font-semibold text-gray-800">📍 Địa chỉ</p>
            <p className="mt-1 text-sm text-gray-600">Tầng 10, Tòa nhà LegalEase, Quận 1, TP. Hồ Chí Minh</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="font-semibold text-gray-800">📞 Điện thoại</p>
            <p className="mt-1 text-sm text-gray-600">1900 1234 (8:00 - 18:00, T2 - T7)</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="font-semibold text-gray-800">✉️ Email</p>
            <p className="mt-1 text-sm text-gray-600">support@legalease.com</p>
          </div>
        </div>

        {/* Form liên hệ */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="font-bold text-gray-800">Gửi tin nhắn cho chúng tôi</h2>

          {sent && (
            <p className="mt-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
              Cảm ơn bạn! Chúng tôi đã nhận được tin nhắn và sẽ phản hồi sớm.
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <Field label="Họ và tên" required value={form.name} onChange={(e) => set('name', e.target.value)} />
            <Field label="Email" type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} />
            <Field label="Nội dung" textarea required value={form.message} onChange={(e) => set('message', e.target.value)} />
            <button
              type="submit"
              className="w-full rounded-md bg-[var(--color-primary)] px-4 py-2.5 font-semibold text-white hover:brightness-110"
            >
              Gửi tin nhắn
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
