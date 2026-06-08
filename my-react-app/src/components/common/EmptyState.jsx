// Hiển thị khi danh sách rỗng / không có dữ liệu.
export default function EmptyState({ icon = '📭', title, description }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
      <div className="text-4xl">{icon}</div>
      <p className="mt-3 font-semibold text-gray-700">{title}</p>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
    </div>
  )
}
