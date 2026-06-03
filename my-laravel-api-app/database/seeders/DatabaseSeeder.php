<?php

namespace Database\Seeders;

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
        User::updateOrCreate(
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
                'is_verified' => false,
                'is_featured' => false,
                'approval_status' => 'pending',
                'rating_avg' => 0,
            ]
        );
        $profile2->specializations()->sync(
            Specialization::whereIn('slug', [Str::slug('Gia đình & Hôn nhân'), Str::slug('Lao động')])->pluck('id')
        );

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

        $this->command->info('Seed LegalEase hoàn tất: 6 thành phố, 6 chuyên môn, 4 tài khoản demo.');
    }
}
