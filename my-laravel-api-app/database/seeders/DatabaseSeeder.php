<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\Appointment;
use App\Models\City;
use App\Models\CustomerProfile;
use App\Models\LawyerAvailability;
use App\Models\LawyerProfile;
use App\Models\Review;
use App\Models\Specialization;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed dữ liệu mẫu cho LegalEase (dùng cho demo & nộp bài).
     */
    public function run(): void
    {
        // ---------- 1. Bảng tra cứu: Tỉnh/Thành phố ----------
        $cityNames = [
            ['name' => 'Hà Nội', 'region' => 'Miền Bắc'],
            ['name' => 'Hải Phòng', 'region' => 'Miền Bắc'],
            ['name' => 'Đà Nẵng', 'region' => 'Miền Trung'],
            ['name' => 'Huế', 'region' => 'Miền Trung'],
            ['name' => 'TP. Hồ Chí Minh', 'region' => 'Miền Nam'],
            ['name' => 'Cần Thơ', 'region' => 'Miền Nam'],
        ];
        foreach ($cityNames as $c) {
            City::firstOrCreate(['name' => $c['name']], $c);
        }
        $hanoi = City::where('name', 'Hà Nội')->first();
        $hcm = City::where('name', 'TP. Hồ Chí Minh')->first();

        // ---------- 2. Bảng tra cứu: Lĩnh vực chuyên môn ----------
        $specs = [
            'Hình sự', 'Dân sự', 'Gia đình & Hôn nhân',
            'Doanh nghiệp', 'Bất động sản', 'Lao động',
        ];
        foreach ($specs as $name) {
            Specialization::firstOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name, 'description' => 'Tư vấn pháp luật lĩnh vực ' . $name]
            );
        }

        // ---------- 3. Tài khoản Admin ----------
        $admin = User::updateOrCreate(
            ['email' => 'admin@legalease.com'],
            [
                'name' => 'Quản trị viên',
                'password' => Hash::make('Admin@123'),
                'phone' => '0900000000',
                'role' => 'admin',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        // ---------- 4. Luật sư 1 (ĐÃ DUYỆT - approved) ----------
        $lawyer1 = User::updateOrCreate(
            ['email' => 'lawyer1@legalease.com'],
            [
                'name' => 'LS. Nguyễn Văn An',
                'password' => Hash::make('Lawyer@123'),
                'phone' => '0911111111',
                'role' => 'lawyer',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );
        $profile1 = LawyerProfile::updateOrCreate(
            ['user_id' => $lawyer1->id],
            [
                'city_id' => $hanoi->id,
                'license_number' => 'HN-12345',
                'experience_years' => 8,
                'bio' => 'Luật sư với 8 năm kinh nghiệm tư vấn hình sự và doanh nghiệp.',
                'office_address' => '123 Phố Huế, Hà Nội',
                'consultation_fee' => 500000,
                'is_verified' => true,
                'is_featured' => true,
                'approval_status' => 'approved',
                'rating_avg' => 0,
            ]
        );
        // Gắn chuyên môn (N:N)
        $profile1->specializations()->sync(
            Specialization::whereIn('slug', [Str::slug('Hình sự'), Str::slug('Doanh nghiệp')])->pluck('id')
        );

        // Khung giờ rảnh: 1 lịch lặp (08:00-17:00 cả năm) + 1 slot cụ thể
        LawyerAvailability::firstOrCreate(
            [
                'lawyer_profile_id' => $profile1->id,
                'start_time' => '08:00:00',
                'end_time' => '17:00:00',
                'repeat_from' => '2026-01-01',
            ],
            [
                'available_date' => null,
                'status' => 'available',
                'repeat_to' => '2026-12-31',
            ]
        );
        $slot = LawyerAvailability::firstOrCreate(
            [
                'lawyer_profile_id' => $profile1->id,
                'available_date' => '2026-06-10',
                'start_time' => '09:00:00',
                'end_time' => '10:00:00',
            ],
            ['status' => 'available']
        );

        // ---------- 5. Luật sư 2 (ĐANG CHỜ DUYỆT - pending) ----------
        $lawyer2 = User::updateOrCreate(
            ['email' => 'lawyer2@legalease.com'],
            [
                'name' => 'LS. Trần Thị Bình',
                'password' => Hash::make('Lawyer@123'),
                'phone' => '0922222222',
                'role' => 'lawyer',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );
        $profile2 = LawyerProfile::updateOrCreate(
            ['user_id' => $lawyer2->id],
            [
                'city_id' => $hcm->id,
                'license_number' => 'HCM-67890',
                'experience_years' => 3,
                'bio' => 'Luật sư trẻ chuyên lĩnh vực gia đình và lao động.',
                'office_address' => '456 Nguyễn Huệ, TP.HCM',
                'consultation_fee' => 300000,
                'is_verified' => true,
                'is_featured' => true,
                'approval_status' => 'approved',
                'rating_avg' => 0,
            ]
        );
        $profile2->specializations()->sync(
            Specialization::whereIn('slug', [Str::slug('Gia đình & Hôn nhân'), Str::slug('Lao động')])->pluck('id')
        );
        // Lịch rảnh cho luật sư 2 (để khách đặt được)
        LawyerAvailability::firstOrCreate(
            ['lawyer_profile_id' => $profile2->id, 'start_time' => '08:00:00', 'end_time' => '17:00:00', 'repeat_from' => '2026-01-01'],
            ['available_date' => null, 'status' => 'available', 'repeat_to' => '2026-12-31']
        );

        // ---------- 5b. Thêm luật sư đã duyệt (cho khách có nhiều lựa chọn) ----------
        $moreLawyers = [
            ['email' => 'lawyer3@legalease.com', 'name' => 'LS. Lê Minh Cường', 'phone' => '0933300003', 'city' => 'Đà Nẵng', 'specs' => ['Bất động sản', 'Dân sự'], 'exp' => 15, 'fee' => 600000, 'featured' => true, 'license' => 'DN-30003', 'office' => '12 Bạch Đằng, Đà Nẵng', 'bio' => 'Chuyên tranh chấp đất đai, thủ tục sang nhượng, sổ đỏ. 15 năm kinh nghiệm tư vấn cho cá nhân và doanh nghiệp bất động sản.'],
            ['email' => 'lawyer4@legalease.com', 'name' => 'LS. Phạm Thu Dung', 'phone' => '0933300004', 'city' => 'Hà Nội', 'specs' => ['Lao động', 'Doanh nghiệp'], 'exp' => 6, 'fee' => 350000, 'featured' => false, 'license' => 'HN-30004', 'office' => '88 Trần Duy Hưng, Hà Nội', 'bio' => 'Tư vấn hợp đồng lao động, tranh chấp lao động, thành lập và vận hành doanh nghiệp.'],
            ['email' => 'lawyer5@legalease.com', 'name' => 'LS. Hoàng Đức Em', 'phone' => '0933300005', 'city' => 'TP. Hồ Chí Minh', 'specs' => ['Doanh nghiệp', 'Dân sự'], 'exp' => 10, 'fee' => 550000, 'featured' => true, 'license' => 'HCM-30005', 'office' => '200 Lê Lợi, TP.HCM', 'bio' => 'Cố vấn pháp lý cho doanh nghiệp vừa và nhỏ, soạn thảo hợp đồng, giải quyết tranh chấp thương mại.'],
            ['email' => 'lawyer6@legalease.com', 'name' => 'LS. Vũ Hải Phong', 'phone' => '0933300006', 'city' => 'Cần Thơ', 'specs' => ['Hình sự'], 'exp' => 9, 'fee' => 450000, 'featured' => false, 'license' => 'CT-30006', 'office' => '5 Hòa Bình, Cần Thơ', 'bio' => 'Luật sư bào chữa hình sự, hỗ trợ thân chủ từ giai đoạn điều tra đến xét xử.'],
            ['email' => 'lawyer7@legalease.com', 'name' => 'LS. Đỗ Quỳnh Giang', 'phone' => '0933300007', 'city' => 'Hải Phòng', 'specs' => ['Gia đình & Hôn nhân'], 'exp' => 5, 'fee' => 300000, 'featured' => false, 'license' => 'HP-30007', 'office' => '17 Lạch Tray, Hải Phòng', 'bio' => 'Tư vấn hôn nhân gia đình, thủ tục kết hôn có yếu tố nước ngoài, nhận con nuôi.'],
            ['email' => 'lawyer8@legalease.com', 'name' => 'LS. Bùi Thanh Hà', 'phone' => '0933300008', 'city' => 'Đà Nẵng', 'specs' => ['Bất động sản', 'Dân sự'], 'exp' => 11, 'fee' => 500000, 'featured' => false, 'license' => 'DN-30008', 'office' => '45 Nguyễn Văn Linh, Đà Nẵng', 'bio' => 'Giải quyết tranh chấp thừa kế, hợp đồng mua bán nhà đất, bồi thường giải phóng mặt bằng.'],
        ];
        foreach ($moreLawyers as $L) {
            $u = User::updateOrCreate(
                ['email' => $L['email']],
                [
                    'name' => $L['name'],
                    'password' => Hash::make('Lawyer@123'),
                    'phone' => $L['phone'],
                    'role' => 'lawyer',
                    'status' => 'active',
                    'email_verified_at' => now(),
                ]
            );
            $city = City::where('name', $L['city'])->first();
            $p = LawyerProfile::updateOrCreate(
                ['user_id' => $u->id],
                [
                    'city_id' => $city?->id,
                    'license_number' => $L['license'],
                    'experience_years' => $L['exp'],
                    'bio' => $L['bio'],
                    'office_address' => $L['office'],
                    'consultation_fee' => $L['fee'],
                    'is_verified' => true,
                    'is_featured' => $L['featured'],
                    'approval_status' => 'approved',
                    'rating_avg' => 0,
                ]
            );
            $p->specializations()->sync(
                Specialization::whereIn('slug', array_map(fn ($s) => Str::slug($s), $L['specs']))->pluck('id')
            );
            // Lịch rảnh lặp lại để khách đặt được
            LawyerAvailability::firstOrCreate(
                ['lawyer_profile_id' => $p->id, 'start_time' => '08:00:00', 'end_time' => '17:00:00', 'repeat_from' => '2026-01-01'],
                ['available_date' => null, 'status' => 'available', 'repeat_to' => '2026-12-31']
            );
        }

        // ---------- 6. Khách hàng 1 (có sẵn lịch hẹn demo) ----------
        $customer1 = User::updateOrCreate(
            ['email' => 'customer1@legalease.com'],
            [
                'name' => 'Lê Thị Khách',
                'password' => Hash::make('Customer@123'),
                'phone' => '0933333333',
                'role' => 'customer',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );
        $custProfile = CustomerProfile::updateOrCreate(
            ['user_id' => $customer1->id],
            [
                'city_id' => $hanoi->id,
                'address' => '789 Bà Triệu, Hà Nội',
                'date_of_birth' => '1995-05-20',
            ]
        );

        // Lịch hẹn 1: đang chờ xác nhận (pending)
        Appointment::firstOrCreate(
            [
                'customer_id' => $custProfile->id,
                'lawyer_profile_id' => $profile1->id,
                'appointment_date' => '2026-06-10',
                'start_time' => '09:00:00',
            ],
            [
                'availability_id' => $slot->id,
                'end_time' => '10:00:00',
                'status' => 'pending',
                'customer_note' => 'Cần tư vấn về tranh chấp hợp đồng lao động.',
            ]
        );

        // Lịch hẹn 2: đã hoàn thành (completed) -> để demo chức năng đánh giá
        $done = Appointment::firstOrCreate(
            [
                'customer_id' => $custProfile->id,
                'lawyer_profile_id' => $profile1->id,
                'appointment_date' => '2026-05-15',
                'start_time' => '14:00:00',
            ],
            [
                'end_time' => '15:00:00',
                'status' => 'completed',
                'customer_note' => 'Tư vấn thành lập doanh nghiệp.',
            ]
        );

        // Đánh giá cho lịch hẹn đã hoàn thành
        Review::firstOrCreate(
            ['appointment_id' => $done->id],
            [
                'customer_id' => $custProfile->id,
                'lawyer_profile_id' => $profile1->id,
                'rating' => 5,
                'comment' => 'Luật sư tư vấn rất tận tình và chuyên nghiệp!',
            ]
        );

        // Cập nhật rating_avg cache cho luật sư 1
        $profile1->update([
            'rating_avg' => round((float) $profile1->reviews()->avg('rating'), 1),
        ]);

        // ---------- 7. Tin tức pháp lý (announcements) đã đăng ----------
        $articles = [
            [
                'title'   => 'Những điểm mới của Luật Đất đai 2024 cần biết',
                'content' => "Luật Đất đai 2024 có nhiều thay đổi đáng chú ý.\n\nThứ nhất, bảng giá đất được cập nhật hằng năm thay vì 5 năm một lần. Thứ hai, mở rộng quyền của người sử dụng đất trong việc chuyển nhượng, cho thuê. Thứ ba, thủ tục cấp giấy chứng nhận quyền sử dụng đất được đơn giản hóa, giảm thời gian xử lý hồ sơ.\n\nNgười dân cần nắm rõ các quy định này để bảo vệ quyền lợi khi thực hiện giao dịch liên quan đến đất đai.",
            ],
            [
                'title'   => 'Thủ tục ly hôn thuận tình năm 2026',
                'content' => "Ly hôn thuận tình là trường hợp cả hai vợ chồng cùng đồng ý chấm dứt hôn nhân.\n\nHồ sơ gồm đơn yêu cầu công nhận thuận tình ly hôn, giấy chứng nhận kết hôn (bản chính), giấy khai sinh của con (nếu có) và giấy tờ về tài sản chung. Tòa án sẽ tiến hành hòa giải; nếu hòa giải không thành sẽ ra quyết định công nhận thuận tình ly hôn.\n\nThời gian giải quyết thường từ 2 đến 3 tháng.",
            ],
            [
                'title'   => 'Quyền lợi của người lao động khi bị chấm dứt hợp đồng',
                'content' => "Khi bị chấm dứt hợp đồng lao động, người lao động có thể được hưởng trợ cấp thôi việc, trợ cấp mất việc làm tùy theo trường hợp.\n\nNếu người sử dụng lao động đơn phương chấm dứt hợp đồng trái pháp luật, người lao động có quyền yêu cầu nhận lại làm việc và bồi thường. Người lao động nên giữ lại hợp đồng lao động và các giấy tờ liên quan để làm cơ sở bảo vệ quyền lợi.",
            ],
        ];
        foreach ($articles as $i => $a) {
            Announcement::firstOrCreate(
                ['title' => $a['title']],
                [
                    'created_by'   => $admin->id,
                    'content'      => $a['content'],
                    'is_published' => true,
                    'published_at' => now()->subDays(($i + 1) * 3),
                ]
            );
        }

        $this->command->info('Seed LegalEase hoàn tất: 6 thành phố, 6 chuyên môn, 8 luật sư đã duyệt, 1 admin, 1 khách hàng, 3 tin tức.');
    }
}
