import { useState } from 'react'
import { faqs } from '../../mock/data'

// FAQ — câu hỏi thường gặp, dạng accordion mở/đóng từng mục.
export default function Faq() {
  const [open, setOpen] = useState(0)

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-[var(--color-primary)]">Câu hỏi thường gặp</h1>
      <p className="mt-1 text-gray-500">Những thắc mắc phổ biến khi sử dụng LegalEase.</p>

      <div className="mt-8 space-y-3">
        {faqs.map((item, i) => {
          const isOpen = open === i
          return (
            <div key={i} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <button
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left font-medium text-gray-800 hover:bg-gray-50"
              >
                <span>{item.q}</span>
                <span className="text-[var(--color-primary)]">{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen && (
                <p className="border-t border-gray-100 px-5 py-4 text-sm leading-relaxed text-gray-600">
                  {item.a}
                </p>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-10 rounded-xl bg-blue-50 p-6 text-center">
        <p className="font-semibold text-[var(--color-primary)]">Không tìm thấy câu trả lời?</p>
        <p className="mt-1 text-sm text-gray-600">Liên hệ với chúng tôi để được hỗ trợ trực tiếp.</p>
        <a href="/lien-he" className="mt-3 inline-block rounded-md bg-[var(--color-accent)] px-5 py-2 text-sm font-semibold text-gray-900 hover:brightness-95">
          Liên hệ ngay
        </a>
      </div>
    </div>
  )
}
