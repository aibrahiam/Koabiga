<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;

class MemberController extends Controller
{
    /**
     * Display a listing of members
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::query();

        // Apply filters
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('christian_name', 'like', "%{$search}%")
                  ->orWhere('family_name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('secondary_phone', 'like', "%{$search}%")
                  ->orWhere('id_passport', 'like', "%{$search}%");
            });
        }

        // Map frontend sort keys to database columns
        $sortMap = [
            'name' => 'christian_name',
            'role' => 'role',
            'status' => 'status',
            'join_date' => 'created_at',
        ];
        $sortBy = $sortMap[$request->get('sort_by', 'name')] ?? 'christian_name';
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        $members = $query
            ->leftJoin('units', 'users.unit_id', '=', 'units.id')
            ->leftJoin('zones', 'users.zone_id', '=', 'zones.id')
            ->select(
                'users.id',
                'users.christian_name',
                'users.family_name',
                'users.id_passport',
                'users.phone',
                'users.secondary_phone',
                'users.role',
                DB::raw('COALESCE(users.status, \'active\') as status'),
                'users.created_at as join_date',
                'units.name as unit',
                'zones.name as zone'
            )
            ->orderBy($sortBy, $sortOrder)
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $members
        ]);
    }

    /**
     * Store a newly created member
     */
    public function store(Request $request): JsonResponse
    {
        try {
            Log::info('Creating new member - Request received', [
                'request_data' => $request->all(),
                'headers' => $request->headers->all()
            ]);
            
            // Force merge JSON if Laravel did not parse it
            if (empty($request->all()) && !empty($request->getContent())) {
                $data = json_decode($request->getContent(), true);
                Log::info('Decoded JSON body:', $data);
                if (is_array($data)) {
                    $request->merge($data);
                    Log::info('Request all data (after merge):', $request->all());
                }
            }
            
            $validator = Validator::make($request->all(), [
                'christian_name' => 'required|string|max:255',
                'family_name' => 'required|string|max:255',
                'id_passport' => 'nullable|string|max:50',
                'phone' => 'required|string|unique:users,phone',
                'secondary_phone' => 'nullable|string|unique:users,secondary_phone',
                'role' => 'required|in:admin,unit_leader,member',
                'status' => 'required|in:active,inactive',
                'zone_id' => 'nullable',
                'unit_id' => 'nullable',
                'pin' => 'required|string|size:5|regex:/^[0-9]+$/',
            ]);

            // Add custom validation for secondary phone
            $validator->after(function ($validator) use ($request) {
                if ($request->secondary_phone && $request->secondary_phone === $request->phone) {
                    $validator->errors()->add('secondary_phone', 'Secondary phone number cannot be the same as primary phone number.');
                }
            });

            // Add custom validation for zone_id and unit_id
            $validator->after(function ($validator) use ($request) {
                if ($request->zone_id && $request->zone_id !== 'none') {
                    if (!is_numeric($request->zone_id) || !DB::table('zones')->where('id', $request->zone_id)->exists()) {
                        $validator->errors()->add('zone_id', 'The selected zone is invalid.');
                    }
                }
                
                if ($request->unit_id && $request->unit_id !== 'none') {
                    if (!is_numeric($request->unit_id) || !DB::table('units')->where('id', $request->unit_id)->exists()) {
                        $validator->errors()->add('unit_id', 'The selected unit is invalid.');
                    }
                }
            });

            Log::info('Validation rules applied', ['rules' => $validator->getRules()]);

            if ($validator->fails()) {
                Log::warning('Member creation validation failed', ['errors' => $validator->errors()]);
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            Log::info('Validation passed, checking for existing user');

            // Check if phone number already exists
            $existingUser = User::where('phone', $request->phone)->first();
            if ($existingUser) {
                Log::warning('Phone number already exists', ['phone' => $request->phone]);
                return response()->json([
                    'success' => false,
                    'message' => 'A user with this phone number already exists.',
                    'errors' => ['phone' => ['This phone number is already registered.']]
                ], 422);
            }

            Log::info('Preparing user data for creation', [
                'christian_name' => $request->christian_name,
                'family_name' => $request->family_name,
                'phone' => $request->phone,
                'role' => $request->role,
                'status' => $request->status,
                'zone_id' => $request->zone_id === 'none' ? null : (int) $request->zone_id,
                'unit_id' => $request->unit_id === 'none' ? null : (int) $request->unit_id,
            ]);

            $userData = [
                'christian_name' => $request->christian_name,
                'family_name' => $request->family_name,
                'id_passport' => $request->id_passport,
                'phone' => \App\Models\User::normalizePhoneNumber($request->phone),
                'secondary_phone' => $request->secondary_phone ? \App\Models\User::normalizePhoneNumber($request->secondary_phone) : null,
                'role' => $request->role,
                'status' => $request->status,
                'zone_id' => $request->zone_id === 'none' ? null : (int) $request->zone_id,
                'unit_id' => $request->unit_id === 'none' ? null : (int) $request->unit_id,
                'pin' => Hash::make($request->pin),
            ];

            Log::info('Creating user with data', $userData);

            $member = User::create($userData);

            Log::info('Member created successfully', [
                'member_id' => $member->id,
                'member_data' => $member->toArray()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Member created successfully',
                'data' => $member
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating member: ' . $e->getMessage(), [
                'request_data' => $request->all(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create member. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Display the specified member
     */
    public function show(int $id): JsonResponse
    {
        $member = User::leftJoin('units', 'users.unit_id', '=', 'units.id')
            ->leftJoin('zones', 'users.zone_id', '=', 'zones.id')
            ->select(
                'users.*',
                'units.name as unit_name',
                'zones.name as zone_name'
            )
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $member
        ]);
    }

    /**
     * Update the specified member
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            Log::info('Updating member - Request received', [
                'member_id' => $id,
                'request_data' => $request->all(),
                'headers' => $request->headers->all()
            ]);
            
            // Force merge JSON if Laravel did not parse it
            if (empty($request->all()) && !empty($request->getContent())) {
                $data = json_decode($request->getContent(), true);
                Log::info('Decoded JSON body:', $data);
                if (is_array($data)) {
                    $request->merge($data);
                    Log::info('Request all data (after merge):', $request->all());
                }
            }

            $member = User::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'christian_name' => 'required|string|max:255',
                'family_name' => 'required|string|max:255',
                'id_passport' => 'required|string|max:50',
                'phone' => 'required|string|unique:users,phone,' . $id,
                'secondary_phone' => 'nullable|string|unique:users,secondary_phone,' . $id,
                'role' => 'required|in:admin,unit_leader,member',
                'status' => 'required|in:active,inactive',
                'zone_id' => 'nullable',
                'unit_id' => 'nullable',
                'pin' => 'nullable|string|size:5|regex:/^[0-9]+$/',
            ]);

            // Add custom validation for secondary phone
            $validator->after(function ($validator) use ($request) {
                if ($request->secondary_phone && $request->secondary_phone === $request->phone) {
                    $validator->errors()->add('secondary_phone', 'Secondary phone number cannot be the same as primary phone number.');
                }
            });

            // Add custom validation for zone_id and unit_id
            $validator->after(function ($validator) use ($request) {
                if ($request->zone_id && $request->zone_id !== 'none') {
                    if (!is_numeric($request->zone_id) || !DB::table('zones')->where('id', $request->zone_id)->exists()) {
                        $validator->errors()->add('zone_id', 'The selected zone is invalid.');
                    }
                }
                
                if ($request->unit_id && $request->unit_id !== 'none') {
                    if (!is_numeric($request->unit_id) || !DB::table('units')->where('id', $request->unit_id)->exists()) {
                        $validator->errors()->add('unit_id', 'The selected unit is invalid.');
                    }
                }
            });

            if ($validator->fails()) {
                Log::warning('Member update validation failed', ['errors' => $validator->errors()]);
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            Log::info('Validation passed, preparing update data');

            $data = $request->all();
            $updateData = [
                'christian_name' => $data['christian_name'] ?? $member->christian_name,
                'family_name' => $data['family_name'] ?? $member->family_name,
                'id_passport' => $data['id_passport'] ?? $member->id_passport,
                'phone' => isset($data['phone']) ? \App\Models\User::normalizePhoneNumber($data['phone']) : $member->phone,
                'role' => $data['role'] ?? $member->role,
                'status' => $data['status'] ?? $member->status,
                'zone_id' => (isset($data['zone_id']) && $data['zone_id'] !== 'none') ? (int) $data['zone_id'] : null,
                'unit_id' => (isset($data['unit_id']) && $data['unit_id'] !== 'none') ? (int) $data['unit_id'] : null,
            ];
            if (isset($data['pin']) && $data['pin']) {
                $updateData['pin'] = Hash::make($data['pin']);
            }

            Log::info('Updating member with data:', $updateData);

            $member->update($updateData);

            Log::info('Member updated successfully', [
                'member_id' => $member->id,
                'member_data' => $member->toArray()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Member updated successfully',
                'data' => $member
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating member: ' . $e->getMessage(), [
                'member_id' => $id,
                'request_data' => $request->all(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update member. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Remove the specified member
     */
    public function destroy(int $id): JsonResponse
    {
        $member = User::findOrFail($id);
        $member->delete();

        return response()->json([
            'success' => true,
            'message' => 'Member deleted successfully'
        ]);
    }

    /**
     * Import members from CSV/Excel file
     */
    public function import(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:csv,xlsx,xls|max:10240', // 10MB max
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $file = $request->file('file');
            $extension = $file->getClientOriginalExtension();
            $importedCount = 0;
            $errors = [];

            if ($extension === 'csv') {
                // Handle CSV import
                $handle = fopen($file->getPathname(), 'r');
                $headers = fgetcsv($handle);
                
                // Validate headers
                $requiredHeaders = ['christian_name', 'family_name', 'phone', 'role', 'status'];
                $headerMap = array_flip($headers);
                
                foreach ($requiredHeaders as $required) {
                    if (!isset($headerMap[$required])) {
                        return response()->json([
                            'success' => false,
                            'message' => "Missing required header: {$required}"
                        ], 422);
                    }
                }

                $rowNumber = 2; // Start from row 2 (after headers)
                while (($data = fgetcsv($handle)) !== false) {
                    try {
                        $memberData = [
                            'christian_name' => $data[$headerMap['christian_name']] ?? '',
                            'family_name' => $data[$headerMap['family_name']] ?? '',
                            'phone' => $data[$headerMap['phone']] ?? '',
                            'role' => $data[$headerMap['role']] ?? 'member',
                            'status' => $data[$headerMap['status']] ?? 'active',
                            'pin' => Hash::make('123456'), // Default PIN
                        ];

                        // Validate member data
                        $memberValidator = Validator::make($memberData, [
                            'christian_name' => 'required|string|max:255',
                            'family_name' => 'required|string|max:255',
                            'phone' => 'required|string|unique:users,phone',
                            'role' => 'required|in:admin,unit_leader,member',
                            'status' => 'required|in:active,inactive',
                        ]);

                        if ($memberValidator->fails()) {
                            $errors[] = "Row {$rowNumber}: " . implode(', ', $memberValidator->errors()->all());
                            $rowNumber++;
                            continue;
                        }

                        User::create($memberData);
                        $importedCount++;
                    } catch (\Exception $e) {
                        $errors[] = "Row {$rowNumber}: " . $e->getMessage();
                    }
                    $rowNumber++;
                }
                fclose($handle);
            } else {
                // Handle Excel import (basic implementation)
                return response()->json([
                    'success' => false,
                    'message' => 'Excel import not yet implemented. Please use CSV format.'
                ], 422);
            }

            return response()->json([
                'success' => true,
                'message' => "Import completed. {$importedCount} members imported successfully.",
                'imported_count' => $importedCount,
                'errors' => $errors
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Import failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export members to CSV
     */
    public function export(Request $request)
    {
        try {
            $query = User::query();

            // Apply the same filters as the index method
            if ($request->filled('role')) {
                $query->where('role', $request->role);
            }

            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('christian_name', 'like', "%{$search}%")
                      ->orWhere('family_name', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%")
                      ->orWhere('id_passport', 'like', "%{$search}%");
                });
            }

                    // Map frontend sort keys to database columns
        $sortMap = [
            'name' => 'christian_name',
            'role' => 'role',
            'status' => 'status',
            'join_date' => 'created_at',
        ];
        $sortBy = $sortMap[$request->get('sort_by', 'name')] ?? 'christian_name';
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        $members = $query
            ->leftJoin('units', 'users.unit_id', '=', 'units.id')
            ->select(
                'users.christian_name',
                'users.family_name',
                'users.id_passport',
                'users.phone',
                'users.role',
                DB::raw('COALESCE(users.status, \'active\') as status'),
                'users.created_at as join_date',
                'units.name as unit'
            )
            ->orderBy($sortBy, $sortOrder)
            ->get();

            $filename = 'members_' . date('Y-m-d_H-i-s') . '.csv';
            $filepath = storage_path('app/public/' . $filename);

            $handle = fopen($filepath, 'w');

            // Add BOM for Excel compatibility
            fwrite($handle, "\xEF\xBB\xBF");

            // Write headers
            fputcsv($handle, ['Christian Name', 'Family Name', 'ID/Passport', 'Phone', 'Role', 'Status', 'Unit', 'Join Date']);

            // Write data
            foreach ($members as $member) {
                fputcsv($handle, [
                    $member->christian_name,
                    $member->family_name,
                    $member->id_passport,
                    $member->phone,
                    ucfirst(str_replace('_', ' ', $member->role)),
                    ucfirst($member->status),
                    $member->unit ?? 'No Unit',
                    $member->join_date->format('Y-m-d')
                ]);
            }

            fclose($handle);

            return response()->download($filepath, $filename, [
                'Content-Type' => 'text/csv; charset=UTF-8',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ])->deleteFileAfterSend();

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Export failed: ' . $e->getMessage()
            ], 500);
        }
    }
} 