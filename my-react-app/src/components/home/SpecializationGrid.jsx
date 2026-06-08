import { Link } from 'react-router-dom'
import { specializations } from '../../mock/data'

// Lưới các lĩnh vực pháp lý; bấm vào -> trang tìm luật sư đã lọc theo lĩnh vực.
export default function SpecializationGrid() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="text-center text-2xl font-bold text-[var(--color-primary)]">Lĩnh vực pháp lý</h2>
      <p className="mt-2 text-center text-gray-500">Chọn lĩnh vực bạn cần tư vấn</p>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {specializations.map((s) => (
          <Link
            key={s.id}
            to={`/tim-luat-su?specialization_id=${s.id}`}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:border-[var(--color-accent)] hover:shadow-md"
          >
            <span className="text-3xl">⚖️</span>
            <span className="text-sm font-medium text-gray-700">{s.name}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
