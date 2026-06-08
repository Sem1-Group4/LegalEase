<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Phân quyền theo role.
 * Dùng: ->middleware('role:admin') hoặc 'role:lawyer'
 * Nhiều role: 'role:admin,lawyer'
 */
class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user || ! in_array($user->role, $roles, true)) {
            return response()->json(['message' => 'Bạn không có quyền truy cập.'], 403);
        }

        return $next($request);
    }
}