// Ô nhập liệu có nhãn, dùng chung cho các form (đăng nhập, đăng ký, hồ sơ...).
export default function Field({ label, type = 'text', textarea, required, ...props }) {
  const base =
    'w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-[var(--color-primary)] focus:outline-none'
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {textarea ? (
        <textarea rows={4} className={base} {...props} />
      ) : (
        <input type={type} className={base} {...props} />
      )}
    </label>
  )
}
