// Nhãn trạng thái lịch hẹn với màu tương ứng.
const MAP = {
  pending: { label: 'Chờ xác nhận', cls: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Đã xác nhận', cls: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Hoàn tất', cls: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Đã hủy', cls: 'bg-gray-200 text-gray-600' },
}

export default function StatusBadge({ status }) {
  const item = MAP[status] || { label: status, cls: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${item.cls}`}>
      {item.label}
    </span>
  )
}
