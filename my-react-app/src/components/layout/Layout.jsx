import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

/**
 * Layout dùng chung: Header cố định trên, nội dung trang ở giữa (Outlet),
 * Footer dưới cùng. Mọi trang đều nằm trong khung này.
 */
export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
