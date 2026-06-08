import { useParams, Link } from 'react-router-dom'
import EmptyState from '../../components/common/EmptyState'
import { getNewsById, news } from '../../mock/data'

// Chi tiết tin tức pháp lý.
export default function NewsDetail() {
  const { id } = useParams()
  const article = getNewsById(id)

  if (!article) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState title="Không tìm thấy bài viết" icon="📰" />
        <div className="mt-6 text-center">
          <Link to="/tin-tuc" className="text-[var(--color-primary)] hover:underline">← Quay lại tin tức</Link>
        </div>
      </div>
    )
  }

  // Bài viết liên quan (khác bài hiện tại), lấy tối đa 3.
  const related = news.filter((n) => n.id !== article.id).slice(0, 3)

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link to="/tin-tuc" className="text-sm text-[var(--color-primary)] hover:underline">← Tin tức pháp lý</Link>

      <article className="mt-4">
        <span className="text-xs font-medium text-[var(--color-accent)]">{article.category}</span>
        <h1 className="mt-1 text-3xl font-bold text-gray-800">{article.title}</h1>
        <p className="mt-2 text-sm text-gray-400">Đăng ngày {article.created_at}</p>

        <div className="mt-6 flex h-52 items-center justify-center rounded-xl bg-blue-50 text-6xl">📰</div>

        <p className="mt-6 leading-relaxed text-gray-700">{article.content}</p>
      </article>

      {related.length > 0 && (
        <section className="mt-12 border-t border-gray-200 pt-6">
          <h2 className="font-bold text-gray-800">Bài viết liên quan</h2>
          <ul className="mt-3 space-y-2">
            {related.map((n) => (
              <li key={n.id}>
                <Link to={`/tin-tuc/${n.id}`} className="text-[var(--color-primary)] hover:underline">
                  {n.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
