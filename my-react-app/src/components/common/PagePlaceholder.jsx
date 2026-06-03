/**
 * Khung trang rỗng dùng chung — hiển thị tên trang + đường dẫn.
 * Mỗi trang sẽ thay nội dung thật vào đây sau.
 */
export default function PagePlaceholder({ title, path, description }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 shadow-sm">
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">{title}</h1>

        <p className="mt-3 text-sm text-gray-500">Đường dẫn:</p>
        <code className="mt-1 inline-block rounded bg-gray-100 px-3 py-1 font-mono text-sm text-gray-800">
          {path}
        </code>

        {description && <p className="mt-4 text-gray-600">{description}</p>}

        <p className="mt-6 inline-block rounded-full bg-yellow-100 px-4 py-1 text-sm font-medium text-yellow-800">
          🚧 Trang đang được xây dựng
        </p>
      </div>
    </div>
  )
}
