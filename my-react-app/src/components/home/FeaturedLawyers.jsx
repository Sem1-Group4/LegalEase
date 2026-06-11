import { useEffect, useState } from 'react'
import api from '../../api/axios'
import LawyerCard from '../common/LawyerCard'

// Lưới luật sư nổi bật trên trang chủ (lấy từ API: lawyers?featured=1).
export default function FeaturedLawyers() {
  const [featured, setFeatured] = useState([])

  useEffect(() => {
    api
      .get('/lawyers', { params: { featured: 1 } })
      .then((res) => setFeatured(res.data.data || []))
      .catch(() => setFeatured([]))
  }, [])

  return (
    <section className="bg-gray-50 py-12">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-2xl font-bold text-[var(--color-primary)]">Luật sư nổi bật</h2>
        <p className="mt-2 text-center text-gray-500">Các luật sư được đánh giá cao trên LegalEase</p>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.length === 0 ? (
            <p className="col-span-full text-center text-gray-400">Chưa có luật sư nổi bật.</p>
          ) : (
            featured.map((l) => <LawyerCard key={l.id} lawyer={l} />)
          )}
        </div>
      </div>
    </section>
  )
}
