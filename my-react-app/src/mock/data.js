// =============================================================
// Dữ liệu mẫu dùng chung cho toàn frontend (chưa nối API thật).
// Cấu trúc khớp với CSDL để sau này dễ thay bằng api.get(...).
// =============================================================

// --- Tỉnh thành ---
export const cities = [
  { id: 1, name: 'Hà Nội' },
  { id: 2, name: 'TP. Hồ Chí Minh' },
  { id: 3, name: 'Đà Nẵng' },
  { id: 4, name: 'Hải Phòng' },
  { id: 5, name: 'Cần Thơ' },
]

// --- Lĩnh vực hành nghề ---
export const specializations = [
  { id: 1, name: 'Hình sự' },
  { id: 2, name: 'Dân sự' },
  { id: 3, name: 'Hôn nhân & Gia đình' },
  { id: 4, name: 'Đất đai - Nhà ở' },
  { id: 5, name: 'Lao động' },
  { id: 6, name: 'Doanh nghiệp' },
]

// --- Luật sư ---
// rating_avg, reviews_count được tính sẵn để hiển thị nhanh.
export const lawyers = [
  {
    id: 1,
    name: 'LS. Nguyễn Văn An',
    phone: '0901 234 567',
    email: 'an.nguyen@legalease.com',
    city: 'Hà Nội',
    city_id: 1,
    specializations: ['Hình sự', 'Dân sự'],
    specialization_ids: [1, 2],
    experience_years: 12,
    consultation_fee: 500000,
    rating_avg: 4.8,
    reviews_count: 34,
    is_verified: true,
    featured: true,
    avatar: null,
    bio: 'Luật sư với hơn 12 năm kinh nghiệm trong lĩnh vực hình sự và dân sự, từng tham gia bào chữa nhiều vụ án lớn. Tận tâm, bảo mật thông tin khách hàng.',
  },
  {
    id: 2,
    name: 'LS. Trần Thị Bình',
    phone: '0902 345 678',
    email: 'binh.tran@legalease.com',
    city: 'TP. Hồ Chí Minh',
    city_id: 2,
    specializations: ['Hôn nhân & Gia đình', 'Dân sự'],
    specialization_ids: [3, 2],
    experience_years: 8,
    consultation_fee: 400000,
    rating_avg: 4.6,
    reviews_count: 21,
    is_verified: true,
    featured: true,
    avatar: null,
    bio: 'Chuyên tư vấn ly hôn, phân chia tài sản, quyền nuôi con. Lắng nghe và đồng hành cùng khách hàng trong những giai đoạn khó khăn.',
  },
  {
    id: 3,
    name: 'LS. Lê Minh Cường',
    phone: '0903 456 789',
    email: 'cuong.le@legalease.com',
    city: 'Đà Nẵng',
    city_id: 3,
    specializations: ['Đất đai - Nhà ở'],
    specialization_ids: [4],
    experience_years: 15,
    consultation_fee: 600000,
    rating_avg: 4.9,
    reviews_count: 47,
    is_verified: true,
    featured: true,
    avatar: null,
    bio: 'Chuyên gia tranh chấp đất đai, thủ tục sang nhượng, sổ đỏ. 15 năm kinh nghiệm tư vấn cho cá nhân và doanh nghiệp bất động sản.',
  },
  {
    id: 4,
    name: 'LS. Phạm Thu Dung',
    phone: '0904 567 890',
    email: 'dung.pham@legalease.com',
    city: 'Hà Nội',
    city_id: 1,
    specializations: ['Lao động', 'Doanh nghiệp'],
    specialization_ids: [5, 6],
    experience_years: 6,
    consultation_fee: 350000,
    rating_avg: 4.4,
    reviews_count: 12,
    is_verified: true,
    featured: false,
    avatar: null,
    bio: 'Tư vấn hợp đồng lao động, tranh chấp lao động, thành lập và vận hành doanh nghiệp. Phong cách làm việc nhanh gọn, rõ ràng.',
  },
  {
    id: 5,
    name: 'LS. Hoàng Đức Em',
    phone: '0905 678 901',
    email: 'em.hoang@legalease.com',
    city: 'TP. Hồ Chí Minh',
    city_id: 2,
    specializations: ['Doanh nghiệp', 'Dân sự'],
    specialization_ids: [6, 2],
    experience_years: 10,
    consultation_fee: 550000,
    rating_avg: 4.7,
    reviews_count: 29,
    is_verified: true,
    featured: false,
    avatar: null,
    bio: 'Cố vấn pháp lý cho doanh nghiệp vừa và nhỏ, soạn thảo hợp đồng, giải quyết tranh chấp thương mại.',
  },
  {
    id: 6,
    name: 'LS. Vũ Hải Phong',
    phone: '0906 789 012',
    email: 'phong.vu@legalease.com',
    city: 'Cần Thơ',
    city_id: 5,
    specializations: ['Hình sự'],
    specialization_ids: [1],
    experience_years: 9,
    consultation_fee: 450000,
    rating_avg: 4.5,
    reviews_count: 18,
    is_verified: true,
    featured: false,
    avatar: null,
    bio: 'Luật sư bào chữa hình sự, hỗ trợ thân chủ từ giai đoạn điều tra đến xét xử. Nhiệt tình, trách nhiệm.',
  },
  {
    id: 7,
    name: 'LS. Đỗ Quỳnh Giang',
    phone: '0907 890 123',
    email: 'giang.do@legalease.com',
    city: 'Hải Phòng',
    city_id: 4,
    specializations: ['Hôn nhân & Gia đình'],
    specialization_ids: [3],
    experience_years: 5,
    consultation_fee: 300000,
    rating_avg: 4.3,
    reviews_count: 9,
    is_verified: true,
    featured: false,
    avatar: null,
    bio: 'Tư vấn hôn nhân gia đình, thủ tục kết hôn có yếu tố nước ngoài, nhận con nuôi.',
  },
  {
    id: 8,
    name: 'LS. Bùi Thanh Hà',
    phone: '0908 901 234',
    email: 'ha.bui@legalease.com',
    city: 'Đà Nẵng',
    city_id: 3,
    specializations: ['Đất đai - Nhà ở', 'Dân sự'],
    specialization_ids: [4, 2],
    experience_years: 11,
    consultation_fee: 500000,
    rating_avg: 4.6,
    reviews_count: 25,
    is_verified: true,
    featured: false,
    avatar: null,
    bio: 'Giải quyết tranh chấp thừa kế, hợp đồng mua bán nhà đất, bồi thường giải phóng mặt bằng.',
  },
]

// --- Đánh giá (review) theo luật sư ---
export const reviews = [
  { id: 1, lawyer_id: 1, customer_name: 'Khách hàng A', rating: 5, comment: 'Luật sư tư vấn rất tận tâm, giải thích dễ hiểu.', created_at: '2026-05-20' },
  { id: 2, lawyer_id: 1, customer_name: 'Khách hàng B', rating: 4, comment: 'Hài lòng với buổi tư vấn, sẽ quay lại.', created_at: '2026-05-12' },
  { id: 3, lawyer_id: 2, customer_name: 'Khách hàng C', rating: 5, comment: 'Cảm ơn luật sư đã giúp tôi rất nhiều.', created_at: '2026-05-18' },
  { id: 4, lawyer_id: 3, customer_name: 'Khách hàng D', rating: 5, comment: 'Chuyên môn vững, xử lý nhanh gọn.', created_at: '2026-05-22' },
  { id: 5, lawyer_id: 3, customer_name: 'Khách hàng E', rating: 4, comment: 'Tư vấn rõ ràng về thủ tục sổ đỏ.', created_at: '2026-04-30' },
]

// --- Khung giờ trống của luật sư (dùng cho trang Đặt lịch) ---
// Mỗi luật sư có sẵn vài ngày, mỗi ngày vài slot giờ.
export const availability = {
  1: [
    { date: '2026-06-10', slots: ['09:00', '10:00', '14:00', '15:00'] },
    { date: '2026-06-11', slots: ['09:00', '11:00', '16:00'] },
    { date: '2026-06-12', slots: ['08:00', '10:00', '14:00'] },
  ],
  2: [
    { date: '2026-06-10', slots: ['10:00', '15:00'] },
    { date: '2026-06-13', slots: ['09:00', '10:00', '11:00'] },
  ],
  3: [
    { date: '2026-06-11', slots: ['08:00', '09:00', '13:00', '14:00'] },
    { date: '2026-06-12', slots: ['10:00', '15:00'] },
  ],
}

// --- Tin tức pháp lý (announcements) ---
export const news = [
  {
    id: 1,
    title: 'Những điểm mới của Luật Đất đai 2024 cần biết',
    excerpt: 'Tổng hợp các thay đổi quan trọng về quyền sử dụng đất, bồi thường và thủ tục cấp sổ.',
    image: null,
    category: 'Đất đai',
    created_at: '2026-05-28',
    content:
      'Luật Đất đai 2024 có nhiều thay đổi đáng chú ý. Thứ nhất, quy định mới về bảng giá đất được cập nhật hằng năm thay vì 5 năm một lần. Thứ hai, mở rộng quyền của người sử dụng đất trong việc chuyển nhượng, cho thuê. Thứ ba, thủ tục cấp giấy chứng nhận quyền sử dụng đất được đơn giản hóa, giảm thời gian xử lý hồ sơ. Người dân cần nắm rõ các quy định này để bảo vệ quyền lợi của mình khi thực hiện các giao dịch liên quan đến đất đai.',
  },
  {
    id: 2,
    title: 'Thủ tục ly hôn thuận tình năm 2026',
    excerpt: 'Hướng dẫn chi tiết hồ sơ, trình tự và thời gian giải quyết ly hôn thuận tình.',
    image: null,
    category: 'Hôn nhân & Gia đình',
    created_at: '2026-05-22',
    content:
      'Ly hôn thuận tình là trường hợp cả hai vợ chồng cùng đồng ý chấm dứt hôn nhân. Hồ sơ gồm đơn yêu cầu công nhận thuận tình ly hôn, giấy chứng nhận kết hôn (bản chính), giấy khai sinh của con (nếu có), và giấy tờ về tài sản chung. Tòa án sẽ tiến hành hòa giải; nếu hòa giải không thành sẽ ra quyết định công nhận thuận tình ly hôn. Thời gian giải quyết thường từ 2 đến 3 tháng.',
  },
  {
    id: 3,
    title: 'Quyền lợi của người lao động khi bị chấm dứt hợp đồng',
    excerpt: 'Người lao động được hưởng những khoản trợ cấp nào khi nghỉ việc?',
    image: null,
    category: 'Lao động',
    created_at: '2026-05-15',
    content:
      'Khi bị chấm dứt hợp đồng lao động, người lao động có thể được hưởng trợ cấp thôi việc, trợ cấp mất việc làm tùy theo trường hợp. Nếu người sử dụng lao động đơn phương chấm dứt hợp đồng trái pháp luật, người lao động có quyền yêu cầu nhận lại làm việc và bồi thường. Người lao động nên giữ lại hợp đồng lao động và các giấy tờ liên quan để làm cơ sở bảo vệ quyền lợi.',
  },
  {
    id: 4,
    title: 'Hướng dẫn thành lập doanh nghiệp cho người mới bắt đầu',
    excerpt: 'Các bước cơ bản để đăng ký thành lập công ty TNHH, cổ phần.',
    image: null,
    category: 'Doanh nghiệp',
    created_at: '2026-05-08',
    content:
      'Để thành lập doanh nghiệp, bạn cần chuẩn bị: lựa chọn loại hình (TNHH, cổ phần, tư nhân), đặt tên công ty, xác định ngành nghề kinh doanh, vốn điều lệ và trụ sở. Hồ sơ đăng ký nộp tại Sở Kế hoạch và Đầu tư. Sau khi có giấy phép, doanh nghiệp cần khắc dấu, mở tài khoản ngân hàng, đăng ký thuế và phát hành hóa đơn. Toàn bộ quá trình thường mất 5-7 ngày làm việc.',
  },
]

// --- Câu hỏi thường gặp ---
export const faqs = [
  { q: 'LegalEase hoạt động như thế nào?', a: 'Bạn tìm luật sư theo tỉnh thành và lĩnh vực, xem hồ sơ, sau đó đặt lịch hẹn theo khung giờ trống của luật sư. Luật sư sẽ xác nhận và liên hệ tư vấn.' },
  { q: 'Chi phí tư vấn được tính ra sao?', a: 'Mỗi luật sư có mức phí tư vấn riêng, hiển thị công khai trên hồ sơ. Bạn xem trước khi đặt lịch.' },
  { q: 'Tôi có thể hủy lịch hẹn không?', a: 'Có. Vào mục "Lịch hẹn của tôi", bạn có thể hủy các lịch ở trạng thái chờ xác nhận hoặc đã xác nhận.' },
  { q: 'Làm sao để đánh giá luật sư?', a: 'Sau khi buổi tư vấn hoàn tất, bạn có thể gửi đánh giá (số sao + nhận xét) trong mục lịch hẹn.' },
  { q: 'Thông tin của tôi có được bảo mật không?', a: 'Mọi thông tin cá nhân và nội dung trao đổi đều được bảo mật theo quy định.' },
]

// --- Lịch hẹn của khách hàng đang đăng nhập (mẫu) ---
// status: pending | confirmed | completed | cancelled
export const myAppointments = [
  { id: 101, lawyer_id: 1, lawyer_name: 'LS. Nguyễn Văn An', specialization: 'Hình sự', date: '2026-06-12', time: '14:00', status: 'confirmed', note: 'Tư vấn về vụ tranh chấp.' },
  { id: 102, lawyer_id: 3, lawyer_name: 'LS. Lê Minh Cường', specialization: 'Đất đai - Nhà ở', date: '2026-06-15', time: '09:00', status: 'pending', note: 'Hỏi về thủ tục sổ đỏ.' },
  { id: 103, lawyer_id: 2, lawyer_name: 'LS. Trần Thị Bình', specialization: 'Hôn nhân & Gia đình', date: '2026-05-20', time: '10:00', status: 'completed', note: '', reviewed: false },
  { id: 104, lawyer_id: 5, lawyer_name: 'LS. Hoàng Đức Em', specialization: 'Doanh nghiệp', date: '2026-05-10', time: '15:00', status: 'cancelled', note: '' },
]

// --- Thông báo (dashboard customer) ---
export const notifications = [
  { id: 1, text: 'Luật sư Nguyễn Văn An đã xác nhận lịch hẹn ngày 12/06.', time: '2 giờ trước', unread: true },
  { id: 2, text: 'Nhắc nhở: bạn có lịch hẹn vào 09:00 ngày 15/06.', time: '1 ngày trước', unread: true },
  { id: 3, text: 'Hãy đánh giá buổi tư vấn với LS. Trần Thị Bình.', time: '3 ngày trước', unread: false },
]

// ===================== Helper =====================

export function getLawyerById(id) {
  return lawyers.find((l) => String(l.id) === String(id)) || null
}

export function getReviewsByLawyer(id) {
  return reviews.filter((r) => String(r.lawyer_id) === String(id))
}

export function getAvailability(id) {
  return availability[id] || []
}

export function getNewsById(id) {
  return news.find((n) => String(n.id) === String(id)) || null
}

// Tìm kiếm + lọc + sắp xếp luật sư (mô phỏng API search).
export function searchLawyers({ cityId, specId, keyword, sort } = {}) {
  let result = [...lawyers]

  if (cityId) result = result.filter((l) => String(l.city_id) === String(cityId))
  if (specId) result = result.filter((l) => l.specialization_ids.includes(Number(specId)))
  if (keyword) {
    const kw = keyword.toLowerCase()
    result = result.filter(
      (l) => l.name.toLowerCase().includes(kw) || l.bio.toLowerCase().includes(kw),
    )
  }

  if (sort === 'rating') result.sort((a, b) => b.rating_avg - a.rating_avg)
  else if (sort === 'experience') result.sort((a, b) => b.experience_years - a.experience_years)
  else if (sort === 'fee_asc') result.sort((a, b) => a.consultation_fee - b.consultation_fee)
  else if (sort === 'fee_desc') result.sort((a, b) => b.consultation_fee - a.consultation_fee)

  return result
}
