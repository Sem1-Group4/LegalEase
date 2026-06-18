import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../api/axios'
import EmptyState from '../../components/common/EmptyState'

// Chi tiết tin tức pháp lý (lấy từ API).
export default function NewsDetail() {
  const { id } = useParams()
  const [article, setArticle] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    api
      .get(`/announcements/${id}`)
      .then((res) => setArticle(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
    // Bài liên quan: lấy danh sách rồi loại bài hiện tại.
    api
      .get('/announcements')
      .then((res) => setRelated(res.data.filter((n) => String(n.id) !== String(id)).slice(0, 3)))
      .catch(() => setRelated([]))
  }, [id])

  if (loading) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-gray-500">Đang tải…</div>
  }

  if (notFound || !article) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState title="Không tìm thấy bài viết" icon="📰" />
        <div className="mt-6 text-center">
          <Link to="/tin-tuc" className="text-[var(--color-primary)] hover:underline">← Quay lại tin tức</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link to="/tin-tuc" className="text-sm text-[var(--color-primary)] hover:underline">← Tin tức pháp lý</Link>

      <article className="mt-4">
        <h1 className="mt-1 text-3xl font-bold text-gray-800">{article.title}</h1>
        <p className="mt-2 text-sm text-gray-400">
          Đăng ngày {article.published_at}{article.author ? ` · ${article.author}` : ''}
        </p>

        {/* Nội dung HTML do admin nhập (Quill). Render bằng dangerouslySetInnerHTML —
            nội dung do admin (người tin cậy) tạo nên rủi ro XSS thấp. */}
        <div
          className="article-content mt-6"
          dangerouslySetInnerHTML={{ __html: article.content || '' }}
        />
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
