import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import EmptyState from '../../components/common/EmptyState'

// Tin tức pháp lý — danh sách bài viết (lấy từ API: announcements đã đăng).
export default function News() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/announcements')
      .then((res) => setNews(res.data))
      .catch(() => setNews([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-[var(--color-primary)]">Tin tức pháp lý</h1>
      <p className="mt-1 text-gray-500">Cập nhật kiến thức và quy định pháp luật mới nhất.</p>

      {loading ? (
        <p className="mt-8 text-gray-500">Đang tải…</p>
      ) : news.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="Chưa có tin tức" description="Hãy quay lại sau nhé." icon="📰" />
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {news.map((n) => (
            <Link
              key={n.id}
              to={`/tin-tuc/${n.id}`}
              className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:border-[var(--color-primary)] hover:shadow-md"
            >
              {n.image ? (
                <img
                  src={n.image}
                  alt={n.title}
                  className="h-40 w-full object-cover"
                />
              ) : (
                <div className="flex h-40 items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 text-5xl">📰</div>
              )}
              <div className="flex flex-1 flex-col p-5">
                <h2 className="line-clamp-2 font-bold text-gray-800">{n.title}</h2>
                <p className="mt-2 line-clamp-3 flex-1 text-sm text-gray-500">{n.excerpt}</p>
                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-400">
                  <span>📅 {n.published_at}</span>
                  <span className="font-semibold text-[var(--color-primary)]">Đọc tiếp →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
