import HeroSearch from '../../components/home/HeroSearch'
import SpecializationGrid from '../../components/home/SpecializationGrid'
import FeaturedLawyers from '../../components/home/FeaturedLawyers'
import SloganBand from '../../components/home/SloganBand'

// Trang chủ — lắp ráp 4 section: Hero + tìm kiếm, Lĩnh vực, Luật sư nổi bật, Khẩu hiệu.
export default function Home() {
  return (
    <>
      <HeroSearch />
      <SpecializationGrid />
      <FeaturedLawyers />
      <SloganBand />
    </>
  )
}
