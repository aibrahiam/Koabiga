<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class MemberController extends Controller
{
    public function index()
    {
        // Fetch users with role 'member' or 'unit_leader'
        $members = User::whereIn('role', ['member', 'unit_leader'])->get();
        return response()->json($members);
    }
} 