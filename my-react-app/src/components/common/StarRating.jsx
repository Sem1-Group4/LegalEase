// Hiển thị số sao (chỉ đọc) hoặc cho phép chọn sao (interactive).
// value: số sao hiện tại; onChange: nếu truyền -> cho phép click chọn.
export default function StarRating({ value = 0, onChange, size = 'text-base' }) {
  const stars = [1, 2, 3, 4, 5]
  const interactive = typeof onChange === 'function'

  return (
    <span className={`inline-flex ${size}`}>
      {stars.map((s) => (
        <span
          key={s}
          onClick={interactive ? () => onChange(s) : undefined}
          className={`${interactive ? 'cursor-pointer' : ''} ${
            s <= Math.round(value) ? 'text-[var(--color-accent)]' : 'text-gray-300'
          }`}
          role={interactive ? 'button' : undefined}
          aria-label={interactive ? `${s} sao` : undefined}
        >
          ★
        </span>
      ))}
    </span>
  )
}
