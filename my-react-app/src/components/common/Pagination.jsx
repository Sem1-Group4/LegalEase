// Phân trang đơn giản: nút Trước / số trang / Sau.
export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const btn = 'rounded-md border px-3 py-1.5 text-sm disabled:opacity-40'

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <button className={btn} disabled={page === 1} onClick={() => onChange(page - 1)}>
        ← Trước
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`rounded-md border px-3 py-1.5 text-sm ${
            p === page
              ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          {p}
        </button>
      ))}
      <button className={btn} disabled={page === totalPages} onClick={() => onChange(page + 1)}>
        Sau →
      </button>
    </div>
  )
}
