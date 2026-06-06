import { useEffect, useState } from 'react'
import api from '../../api/axios'
import LawyerCard from '../common/LawyerCard'

// Lưới luật sư nổi bật trên trang chủ.
export default function FeaturedLawyers() {
  const [lawyers, setLawyers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    api
      .get('/lawyers', { params: { featured: 1 } })
      .then((res) => setLawyers(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="bg-gray-50 py-12">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-2xl font-bold text-[var(--color-primary)]">Luật sư nổi bật</h2>
        <p className="mt-2 text-center text-gray-500">Các luật sư được đánh giá cao trên LegalEase</p>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-xl bg-gray-100" />
            ))
          ) : error ? (
            <p className="col-span-full text-center text-gray-400">Không tải được danh sách luật sư.</p>
          ) : lawyers.length === 0 ? (
            <p className="col-span-full text-center text-gray-400">Chưa có luật sư nổi bật.</p>
          ) : (
            lawyers.map((l) => <LawyerCard key={l.id} lawyer={l} />)
          )}
        </div>
      </div>
    </section>
  )
}
