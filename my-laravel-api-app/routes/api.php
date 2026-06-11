<?php

use App\Http\Controllers\Api\PublicController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Admin\LawyerController as AdminLawyerController;
use App\Http\Controllers\Api\Admin\CustomerController as AdminCustomerController;
use App\Http\Controllers\Api\Admin\ReportController as AdminReportController;
use App\Http\Controllers\Api\Admin\AnnouncementController as AdminAnnouncementController;
use App\Http\Controllers\Api\Admin\SiteContentController as AdminSiteContentController;
use App\Http\Controllers\Api\Lawyer\DashboardController as LawyerDashboardController;
use App\Http\Controllers\Api\Lawyer\ProfileController as LawyerProfileController;
use App\Http\Controllers\Api\Lawyer\AvailabilityController as LawyerAvailabilityController;
use App\Http\Controllers\Api\Admin\AppointmentController as AdminAppointmentController;
use App\Http\Controllers\Api\Customer\AppointmentController as CustomerAppointmentController;
use App\Http\Controllers\Api\Customer\NotificationController as CustomerNotificationController;
use App\Http\Controllers\Api\Customer\ProfileController as CustomerProfileController;

// ---------- API công khai (không cần đăng nhập) ----------
Route::get('/cities', [PublicController::class, 'cities']);
Route::get('/specializations', [PublicController::class, 'specializations']);
Route::get('/lawyers', [PublicController::class, 'lawyers']);
Route::get('/lawyers/{lawyer}', [PublicController::class, 'show']);
Route::get('/lawyers/{lawyer}/slots', [PublicController::class, 'slots']);
Route::get('/lawyers/{lawyer}/reviews', [PublicController::class, 'reviews']);
Route::get('/announcements', [PublicController::class, 'news']);
Route::get('/announcements/{announcement}', [PublicController::class, 'newsDetail']);

// ---------- API cần đăng nhập (Sanctum) ----------
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// ---------- Auth (phần chung) ----------
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
});

// ---------- Khu vực ADMIN ----------
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/lawyers', [AdminLawyerController::class, 'index']);
    Route::patch('/lawyers/{lawyer}/approve', [AdminLawyerController::class, 'approve']);
    Route::patch('/lawyers/{lawyer}/reject', [AdminLawyerController::class, 'reject']);
    Route::patch('/lawyers/{lawyer}/toggle-active', [AdminLawyerController::class, 'toggleActive']);
    Route::get('/customers', [AdminCustomerController::class, 'index']);
    Route::get('/customers/{customer}', [AdminCustomerController::class, 'show']);
    Route::patch('/customers/{customer}/toggle-active', [AdminCustomerController::class, 'toggleActive']);
    Route::delete('/customers/{customer}', [AdminCustomerController::class, 'destroy']);
    Route::get('/reports/overview', [AdminReportController::class, 'overview']);
    Route::get('/reports/lawyers-by-city', [AdminReportController::class, 'lawyersByCity']);
        Route::get('/announcements', [AdminAnnouncementController::class, 'index']);
    Route::get('/announcements/{announcement}', [AdminAnnouncementController::class, 'show']);
    Route::post('/announcements', [AdminAnnouncementController::class, 'store']);
    Route::put('/announcements/{announcement}', [AdminAnnouncementController::class, 'update']);
    Route::delete('/announcements/{announcement}', [AdminAnnouncementController::class, 'destroy']);
    Route::get('/site-contents', [AdminSiteContentController::class, 'index']);
    Route::put('/site-contents/{key}', [AdminSiteContentController::class, 'upsert']);
    Route::get('/appointments', [AdminAppointmentController::class, 'index']);
    Route::get('/appointments/{appointment}', [AdminAppointmentController::class, 'show']);
    Route::patch('/appointments/{appointment}/cancel', [AdminAppointmentController::class, 'cancel']);
});
// ---------- Khu vực LAWYER ----------
Route::middleware(['auth:sanctum', 'role:lawyer'])->prefix('lawyer')->group(function () {
    Route::get('/dashboard', [LawyerDashboardController::class, 'index']);
    Route::get('/profile', [LawyerProfileController::class, 'show']);
    Route::put('/profile', [LawyerProfileController::class, 'update']);
    Route::get('/availabilities/slots', [LawyerAvailabilityController::class, 'availableSlots']); // THÊM DÒNG NÀY - đặt TRƯỚC {availability}
    Route::get('/availabilities', [LawyerAvailabilityController::class, 'index']);
    Route::post('/availabilities', [LawyerAvailabilityController::class, 'store']);
    Route::put('/availabilities/{availability}', [LawyerAvailabilityController::class, 'update']);
    Route::delete('/availabilities/{availability}', [LawyerAvailabilityController::class, 'destroy']);
});

// ---------- Khu vực CUSTOMER ----------
Route::middleware(['auth:sanctum', 'role:customer'])->prefix('customer')->group(function () {
    // Lịch hẹn
    Route::get('/appointments', [CustomerAppointmentController::class, 'index']);
    Route::post('/appointments', [CustomerAppointmentController::class, 'store']);
    Route::patch('/appointments/{appointment}/cancel', [CustomerAppointmentController::class, 'cancel']);
    Route::post('/appointments/{appointment}/review', [CustomerAppointmentController::class, 'review']);

    // Thông báo
    Route::get('/notifications', [CustomerNotificationController::class, 'index']);
    Route::patch('/notifications/read-all', [CustomerNotificationController::class, 'markAllRead']); // đặt TRƯỚC {notification}
    Route::patch('/notifications/{notification}/read', [CustomerNotificationController::class, 'markRead']);

    // Hồ sơ cá nhân
    Route::get('/profile', [CustomerProfileController::class, 'show']);
    Route::put('/profile', [CustomerProfileController::class, 'update']);
});