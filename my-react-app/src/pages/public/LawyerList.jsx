import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import LawyerCard from '../../components/common/LawyerCard'
import Pagination from '../../components/common/Pagination'
import EmptyState from '../../components/common/EmptyState'
import { cities, specializations, searchLawyers } from '../../mock/data'

const PER_PAGE = 6

// Tìm kiếm / Danh sách luật sư — lọc theo tỉnh + lĩnh vực, sắp xếp, phân trang.
export default function LawyerList() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Khởi tạo bộ lọc từ query string (đến từ thanh tìm kiếm trang chủ).
  const [cityId, setCityId] = useState(searchParams.get('city_id') || '')
  const [specId, setSpecId] = useState(searchParams.get('specialization_id') || '')
  const [keyword, setKeyword] = useState('')
  const [sort, setSort] = useState('')
  const [page, setPage] = useState(1)

  // Đổi bộ lọc tỉnh/lĩnh vực: cập nhật state, đồng bộ URL (chia sẻ được) và về trang 1.
  function applyFilter(nextCity, nextSpec) {
    setCityId(nextCity)
    setSpecId(nextSpec)
    setPage(1)
    const p = {}
    if (nextCity) p.city_id = nextCity
    if (nextSpec) p.specialization_id = nextSpec
    setSearchParams(p, { replace: true })
  }

  const results = useMemo(
    () => searchLawyers({ cityId, specId, keyword, sort }),
    [cityId, specId, keyword, sort],
  )

  const totalPages = Math.ceil(results.length / PER_PAGE)
  const pageItems = results.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const selectCls =
    'rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-[var(--color-primary)] focus:outline-none'

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-[var(--color-primary)]">Tìm luật sư</h1>
      <p className="mt-1 text-gray-500">Lọc theo tỉnh thành, lĩnh vực và sắp xếp theo nhu cầu của bạn.</p>

      {/* Thanh bộ lọc */}
      <div className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-1 flex-col gap-1" style={{ minWidth: 180 }}>
          <label className="text-xs font-medium text-gray-500">Tỉnh thành</label>
          <select value={cityId} onChange={(e) => applyFilter(e.target.value, specId)} className={selectCls}>
            <option value="">Tất cả tỉnh thành</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-1 flex-col gap-1" style={{ minWidth: 180 }}>
          <label className="text-xs font-medium text-gray-500">Lĩnh vực</label>
          <select value={specId} onChange={(e) => applyFilter(cityId, e.target.value)} className={selectCls}>
            <option value="">Tất cả lĩnh vực</option>
            {specializations.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-1 flex-col gap-1" style={{ minWidth: 180 }}>
          <label className="text-xs font-medium text-gray-500">Tìm theo tên</label>
          <input
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(1) }}
            placeholder="Nhập tên luật sư..."
            className={selectCls}
          />
        </div>

        <div className="flex flex-col gap-1" style={{ minWidth: 180 }}>
          <label className="text-xs font-medium text-gray-500">Sắp xếp</label>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className={selectCls}>
            <option value="">Mặc định</option>
            <option value="rating">Đánh giá cao nhất</option>
            <option value="experience">Kinh nghiệm nhiều nhất</option>
            <option value="fee_asc">Phí thấp → cao</option>
            <option value="fee_desc">Phí cao → thấp</option>
          </select>
        </div>
      </div>

      {/* Kết quả */}
      <p className="mt-6 text-sm text-gray-500">Tìm thấy {results.length} luật sư.</p>

      {results.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="Không tìm thấy luật sư phù hợp" description="Thử bỏ bớt bộ lọc hoặc đổi từ khóa tìm kiếm." icon="🔍" />
        </div>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((l) => (
              <LawyerCard key={l.id} lawyer={l} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  )
}
