<?php

use App\Http\Controllers\Api\PublicController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

// ---------- API công khai (không cần đăng nhập) ----------
Route::get('/cities', [PublicController::class, 'cities']);
Route::get('/specializations', [PublicController::class, 'specializations']);
Route::get('/lawyers', [PublicController::class, 'lawyers']);

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