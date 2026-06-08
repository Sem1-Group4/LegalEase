import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cities, specializations } from '../../mock/data'

// Banner trang chủ + thanh tìm kiếm (tỉnh thành + lĩnh vực) — dùng dữ liệu mẫu.
export default function HeroSearch() {
  const navigate = useNavigate()
  const [cityId, setCityId] = useState('')
  const [specId, setSpecId] = useState('')

  function handleSearch(e) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (cityId) params.set('city_id', cityId)
    if (specId) params.set('specialization_id', specId)
    const query = params.toString()
    navigate(query ? `/tim-luat-su?${query}` : '/tim-luat-su')
  }

  return (
    <section className="bg-[var(--color-primary)] px-4 py-16 text-white">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold md:text-4xl">Cùng bạn chia sẻ mọi vấn đề pháp luật</h1>
        <p className="mt-3 text-blue-100">
          Tìm và đặt lịch hẹn với luật sư phù hợp trên khắp Việt Nam.
        </p>

        <form
          onSubmit={handleSearch}
          className="mt-8 flex flex-col gap-3 rounded-xl bg-white p-4 shadow-lg md:flex-row"
        >
          <select
            value={cityId}
            onChange={(e) => setCityId(e.target.value)}
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-gray-700"
          >
            <option value="">Tất cả tỉnh thành</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={specId}
            onChange={(e) => setSpecId(e.target.value)}
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-gray-700"
          >
            <option value="">Tất cả lĩnh vực</option>
            {specializations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="rounded-md bg-[var(--color-accent)] px-6 py-2 font-semibold text-gray-900 hover:brightness-95"
          >
            Tìm kiếm
          </button>
        </form>
      </div>
    </section>
  )
}
