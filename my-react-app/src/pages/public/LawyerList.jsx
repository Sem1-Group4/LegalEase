import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../../api/axios'
import LawyerCard from '../../components/common/LawyerCard'
import Pagination from '../../components/common/Pagination'
import EmptyState from '../../components/common/EmptyState'

const PER_PAGE = 6

// Tìm kiếm / Danh sách luật sư — lọc theo tỉnh + lĩnh vực (gọi API), tìm theo tên + sắp xếp + phân trang (client).
export default function LawyerList() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Danh mục dropdown (lấy từ API).
  const [cities, setCities] = useState([])
  const [specializations, setSpecializations] = useState([])

  // Bộ lọc khởi tạo từ query string (đến từ thanh tìm kiếm trang chủ).
  const [cityId, setCityId] = useState(searchParams.get('city_id') || '')
  const [specId, setSpecId] = useState(searchParams.get('specialization_id') || '')
  const [keyword, setKeyword] = useState('')
  const [sort, setSort] = useState('')
  const [page, setPage] = useState(1)

  // Kết quả luật sư từ API.
  const [lawyers, setLawyers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Tải danh mục 1 lần.
  useEffect(() => {
    api.get('/cities').then((res) => setCities(res.data)).catch(() => {})
    api.get('/specializations').then((res) => setSpecializations(res.data)).catch(() => {})
  }, [])

  // Tải luật sư mỗi khi đổi tỉnh / lĩnh vực (lấy tối đa 100 rồi lọc tên + sắp xếp ở client).
  useEffect(() => {
    setLoading(true)
    setError('')
    const params = { per_page: 100 }
    if (cityId) params.city_id = cityId
    if (specId) params.specialization_id = specId
    api
      .get('/lawyers', { params })
      .then((res) => setLawyers(res.data.data || []))
      .catch(() => setError('Không tải được danh sách luật sư.'))
      .finally(() => setLoading(false))
  }, [cityId, specId])

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

  // Lọc theo tên + sắp xếp ở client (để tìm kiếm tức thời, không gọi lại API mỗi phím).
  const results = useMemo(() => {
    let list = [...lawyers]
    if (keyword) {
      const kw = keyword.toLowerCase()
      list = list.filter(
        (l) => l.name?.toLowerCase().includes(kw) || l.bio?.toLowerCase().includes(kw),
      )
    }
    if (sort === 'rating') list.sort((a, b) => b.rating_avg - a.rating_avg)
    else if (sort === 'experience') list.sort((a, b) => b.experience_years - a.experience_years)
    else if (sort === 'fee_asc') list.sort((a, b) => a.consultation_fee - b.consultation_fee)
    else if (sort === 'fee_desc') list.sort((a, b) => b.consultation_fee - a.consultation_fee)
    return list
  }, [lawyers, keyword, sort])

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
      {loading ? (
        <p className="mt-6 text-gray-500">Đang tải…</p>
      ) : error ? (
        <p className="mt-6 text-red-600">{error}</p>
      ) : (
        <>
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
        </>
      )}
    </div>
  )
}
