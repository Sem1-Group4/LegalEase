import { Link } from 'react-router-dom'
import { news } from '../../mock/data'

// Tin tức pháp lý — danh sách bài viết.
export default function News() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-[var(--color-primary)]">Tin tức pháp lý</h1>
      <p className="mt-1 text-gray-500">Cập nhật kiến thức và quy định pháp luật mới nhất.</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {news.map((n) => (
          <Link
            key={n.id}
            to={`/tin-tuc/${n.id}`}
            className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex h-40 items-center justify-center bg-blue-50 text-5xl">📰</div>
            <div className="flex flex-1 flex-col p-5">
              <span className="text-xs font-medium text-[var(--color-accent)]">{n.category}</span>
              <h2 className="mt-1 font-bold text-gray-800">{n.title}</h2>
              <p className="mt-2 flex-1 text-sm text-gray-500">{n.excerpt}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                <span>{n.created_at}</span>
                <span className="font-semibold text-[var(--color-primary)]">Đọc tiếp →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
