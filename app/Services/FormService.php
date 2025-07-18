<?php

namespace App\Services;

use App\Models\Form;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class FormService
{
    /**
     * Get all available forms from the leaders folder
     */
    public static function getAvailableForms(): array
    {
        $formsPath = resource_path('js/pages/koabiga/leaders/forms');
        $forms = [];

        if (File::exists($formsPath)) {
            $files = File::files($formsPath);
            
            foreach ($files as $file) {
                if ($file->getExtension() === 'tsx') {
                    $formName = $file->getBasename('.tsx');
                    $formData = self::parseFormFile($file->getPathname());
                    
                    if ($formData) {
                        $forms[] = [
                            'name' => $formName,
                            'title' => $formData['title'] ?? Str::title(str_replace('-', ' ', $formName)),
                            'type' => $formData['type'] ?? 'application',
                            'category' => $formData['category'] ?? 'other',
                            'description' => $formData['description'] ?? '',
                            'fields' => $formData['fields'] ?? [],
                            'target_roles' => $formData['target_roles'] ?? ['unit_leader'],
                            'file_path' => $file->getPathname(),
                            'file_size' => $file->getSize(),
                            'modified_at' => $file->getMTime(),
                            'exists_in_db' => Form::where('name', $formName)->exists(),
                        ];
                    }
                }
            }
        }

        return $forms;
    }

    /**
     * Create a new form file in the leaders folder
     */
    public static function createFormFile(array $formData): array
    {
        try {
            $formsPath = resource_path('js/pages/koabiga/leaders/forms');
            
            if (!File::exists($formsPath)) {
                File::makeDirectory($formsPath, 0755, true);
            }

            $formName = Str::kebab($formData['name']);
            $fileName = $formName . '.tsx';
            $filePath = $formsPath . '/' . $fileName;

            // Check if file already exists
            if (File::exists($filePath)) {
                return [
                    'success' => false,
                    'message' => 'Form file already exists',
                    'file_path' => $filePath
                ];
            }

            // Generate the form file content
            $content = self::generateFormFileContent($formData);

            // Write the file
            File::put($filePath, $content);

            return [
                'success' => true,
                'message' => 'Form file created successfully',
                'file_path' => $filePath,
                'file_name' => $fileName,
                'form_name' => $formName
            ];
        } catch (\Exception $e) {
            Log::error('Error creating form file: ' . $e->getMessage(), ['form_data' => $formData]);
            
            return [
                'success' => false,
                'message' => 'Failed to create form file: ' . $e->getMessage(),
                'file_path' => null
            ];
        }
    }

    /**
     * Generate TypeScript/React form file content
     */
    private static function generateFormFileContent(array $formData): string
    {
        $formName = Str::kebab($formData['name']);
        $componentName = Str::studly($formData['name']);
        $title = $formData['title'];
        $description = $formData['description'] ?? '';
        $fields = $formData['fields'] ?? [];
        $targetRoles = $formData['target_roles'] ?? ['unit_leader'];

        // Generate field interfaces
        $fieldInterfaces = [];
        foreach ($fields as $field) {
            $fieldName = Str::camel($field['name']);
            $fieldType = $field['type'] === 'number' ? 'number' : 'string';
            $fieldInterfaces[] = "    {$fieldName}: {$fieldType};";
        }

        // Generate form fields JSX
        $formFields = [];
        foreach ($fields as $field) {
            $fieldName = Str::camel($field['name']);
            $label = $field['label'];
            $required = $field['required'] ? ' *' : '';
            $placeholder = $field['placeholder'] ?? '';
            
            switch ($field['type']) {
                case 'textarea':
                    $formFields[] = "                        <div className=\"space-y-2\">
                            <Label htmlFor=\"{$fieldName}\">{$label}{$required}</Label>
                            <Textarea
                                id=\"{$fieldName}\"
                                value={formData.{$fieldName}}
                                onChange={(e) => setFormData({{...formData, {$fieldName}: e.target.value}})}
                                placeholder=\"{$placeholder}\"
                                rows={3}
                            />
                        </div>";
                    break;
                case 'select':
                    $options = $field['options'] ?? [];
                    $optionsJsx = implode("\n                                    ", array_map(function($option) {
                        return "<SelectItem value=\"{$option}\">{$option}</SelectItem>";
                    }, $options));
                    $formFields[] = "                        <div className=\"space-y-2\">
                            <Label htmlFor=\"{$fieldName}\">{$label}{$required}</Label>
                            <Select 
                                value={formData.{$fieldName}} 
                                onValueChange={(value) => setFormData({{...formData, {$fieldName}: value}})}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder=\"{$placeholder}\" />
                                </SelectTrigger>
                                <SelectContent>
                                    {$optionsJsx}
                                </SelectContent>
                            </Select>
                        </div>";
                    break;
                case 'date':
                    $formFields[] = "                        <div className=\"space-y-2\">
                            <Label htmlFor=\"{$fieldName}\">{$label}{$required}</Label>
                            <Input
                                id=\"{$fieldName}\"
                                type=\"date\"
                                value={formData.{$fieldName}}
                                onChange={(e) => setFormData({{...formData, {$fieldName}: e.target.value}})}
                            />
                        </div>";
                    break;
                case 'number':
                    $formFields[] = "                        <div className=\"space-y-2\">
                            <Label htmlFor=\"{$fieldName}\">{$label}{$required}</Label>
                            <Input
                                id=\"{$fieldName}\"
                                type=\"number\"
                                step=\"0.01\"
                                value={formData.{$fieldName}}
                                onChange={(e) => setFormData({{...formData, {$fieldName}: e.target.value}})}
                                placeholder=\"{$placeholder}\"
                            />
                        </div>";
                    break;
                default:
                    $formFields[] = "                        <div className=\"space-y-2\">
                            <Label htmlFor=\"{$fieldName}\">{$label}{$required}</Label>
                            <Input
                                id=\"{$fieldName}\"
                                value={formData.{$fieldName}}
                                onChange={(e) => setFormData({{...formData, {$fieldName}: e.target.value}})}
                                placeholder=\"{$placeholder}\"
                            />
                        </div>";
            }
        }

        $formFieldsJsx = implode("\n\n", $formFields);
        $fieldInterfacesJsx = implode("\n", $fieldInterfaces);
        $targetRolesJsx = implode(', ', $targetRoles);

        // Generate initial form data
        $initialFormData = [];
        foreach ($fields as $field) {
            $fieldName = Str::camel($field['name']);
            $defaultValue = $field['type'] === 'number' ? '0' : "''";
            $initialFormData[] = "        {$fieldName}: {$defaultValue}";
        }
        $initialFormDataJsx = implode(",\n", $initialFormData);

        return "import { Head, router } from '@inertiajs/react';
import { 
    Save,
    X,
    ArrowLeft,
    LoaderCircle,
    AlertTriangle,
    CheckCircle
} from 'lucide-react';
import { useState } from 'react';
import axios from '@/lib/axios';

import UnitLeaderLayout from '@/layouts/unit-leader-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FormData {
{$fieldInterfacesJsx}
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Unit Leader Dashboard',
        href: '/koabiga/leaders/dashboard',
    },
    {
        title: 'Forms',
        href: '/koabiga/leaders/forms',
    },
    {
        title: '{$title}',
        href: '/koabiga/leaders/forms/{$formName}',
    },
];

export default function {$componentName}Form() {
    const [formData, setFormData] = useState<FormData>({
{$initialFormDataJsx}
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            setError(null);

            const response = await axios.post('/api/leaders/forms/{$formName}', formData);

            if (response.data.success) {
                setSuccess('Form submitted successfully!');
                setTimeout(() => {
                    router.visit('/koabiga/leaders/forms');
                }, 2000);
            } else {
                setError(response.data.message || 'Failed to submit form');
            }
        } catch (err: any) {
            console.error('Error submitting form:', err);
            setError(err.response?.data?.message || 'Failed to submit form. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.visit('/koabiga/leaders/forms');
    };

    return (
        <UnitLeaderLayout breadcrumbs={breadcrumbs}>
            <Head title=\"{$title} - Unit Leader\" />
            
            <div className=\"flex h-full flex-1 flex-col gap-6 p-6\">
                {/* Header */}
                <div className=\"flex items-center justify-between\">
                    <div className=\"flex items-center gap-4\">
                        <Button onClick={handleCancel} variant=\"outline\" size=\"sm\">
                            <ArrowLeft className=\"h-4 w-4 mr-2\" />
                            Back to Forms
                        </Button>
                        <div>
                            <h1 className=\"text-3xl font-bold text-gray-900 dark:text-white\">{$title}</h1>
                            <p className=\"text-gray-600 dark:text-gray-400\">{$description}</p>
                        </div>
                    </div>
                </div>

                {/* Alerts */}
                {error && (
                    <Alert variant=\"destructive\" className=\"border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20\">
                        <AlertTriangle className=\"h-4 w-4\" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {success && (
                    <Alert className=\"border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20\">
                        <CheckCircle className=\"h-4 w-4 text-green-600\" />
                        <AlertDescription className=\"text-green-800 dark:text-green-200\">{success}</AlertDescription>
                    </Alert>
                )}

                <div className=\"grid gap-6 lg:grid-cols-3\">
                    {/* Main Form */}
                    <div className=\"lg:col-span-2\">
                        <Card>
                            <CardHeader>
                                <CardTitle>{$title}</CardTitle>
                                <CardDescription>{$description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className=\"space-y-6\">
{$formFieldsJsx}

                                    {/* Form Actions */}
                                    <div className=\"flex items-center gap-4 pt-6\">
                                        <Button 
                                            type=\"submit\" 
                                            disabled={loading}
                                            className=\"flex items-center gap-2\"
                                        >
                                            {loading ? (
                                                <LoaderCircle className=\"h-4 w-4 animate-spin\" />
                                            ) : (
                                                <Save className=\"h-4 w-4\" />
                                            )}
                                            Submit Form
                                        </Button>
                                        <Button 
                                            type=\"button\" 
                                            variant=\"outline\" 
                                            onClick={handleCancel}
                                            disabled={loading}
                                        >
                                            <X className=\"h-4 w-4 mr-2\" />
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className=\"space-y-6\">
                        {/* Form Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Form Information</CardTitle>
                            </CardHeader>
                            <CardContent className=\"space-y-4\">
                                <div className=\"flex items-center gap-2\">
                                    <span className=\"text-sm font-medium\">{$title}</span>
                                </div>
                                <p className=\"text-sm text-muted-foreground\">
                                    {$description}
                                </p>
                                <div className=\"space-y-2\">
                                    <div className=\"flex justify-between text-sm\">
                                        <span>Form Type:</span>
                                        <span className=\"font-medium\">{$formData['type']}</span>
                                    </div>
                                    <div className=\"flex justify-between text-sm\">
                                        <span>Category:</span>
                                        <span className=\"font-medium\">{$formData['category']}</span>
                                    </div>
                                    <div className=\"flex justify-between text-sm\">
                                        <span>Access Level:</span>
                                        <span className=\"font-medium\">{$targetRolesJsx}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </UnitLeaderLayout>
    );
}";
    }

    /**
     * Delete a form file from the leaders folder
     */
    public static function deleteFormFile(string $formName): array
    {
        try {
            $formsPath = resource_path('js/pages/koabiga/leaders/forms');
            $fileName = Str::kebab($formName) . '.tsx';
            $filePath = $formsPath . '/' . $fileName;

            if (!File::exists($filePath)) {
                return [
                    'success' => false,
                    'message' => 'Form file not found',
                    'file_path' => $filePath
                ];
            }

            // Delete the file
            File::delete($filePath);

            return [
                'success' => true,
                'message' => 'Form file deleted successfully',
                'file_path' => $filePath
            ];
        } catch (\Exception $e) {
            Log::error('Error deleting form file: ' . $e->getMessage(), ['form_name' => $formName]);
            
            return [
                'success' => false,
                'message' => 'Failed to delete form file: ' . $e->getMessage(),
                'file_path' => null
            ];
        }
    }

    /**
     * Parse a form file to extract form configuration
     */
    private static function parseFormFile(string $filePath): ?array
    {
        try {
            $content = File::get($filePath);
            
            // Extract form data from the file
            $formData = [
                'title' => self::extractTitle($content),
                'type' => self::extractType($content),
                'category' => self::extractCategory($content),
                'description' => self::extractDescription($content),
                'fields' => self::extractFields($content),
                'target_roles' => self::extractTargetRoles($content),
            ];

            return $formData;
        } catch (\Exception $e) {
            Log::error('Error parsing form file: ' . $e->getMessage(), ['file' => $filePath]);
            return null;
        }
    }

    /**
     * Extract title from form content
     */
    private static function extractTitle(string $content): string
    {
        // Look for title in various patterns
        $patterns = [
            '/title\s*[:=]\s*["\']([^"\']+)["\']/',
            '/FormTitle\s*[:=]\s*["\']([^"\']+)["\']/',
            '/<h1[^>]*>([^<]+)<\/h1>/',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $content, $matches)) {
                return trim($matches[1]);
            }
        }

        return '';
    }

    /**
     * Extract form type from content
     */
    private static function extractType(string $content): string
    {
        $patterns = [
            '/type\s*[:=]\s*["\']([^"\']+)["\']/',
            '/FormType\s*[:=]\s*["\']([^"\']+)["\']/',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $content, $matches)) {
                $type = strtolower($matches[1]);
                if (in_array($type, ['request', 'registration', 'report', 'application', 'feedback'])) {
                    return $type;
                }
            }
        }

        // Infer type from filename
        if (str_contains($content, 'creation')) {
            return 'registration';
        } elseif (str_contains($content, 'assignment')) {
            return 'application';
        } else {
            return 'application';
        }
    }

    /**
     * Extract category from content
     */
    private static function extractCategory(string $content): string
    {
        $categories = ['land', 'crop', 'equipment', 'member', 'harvest', 'financial', 'training', 'other'];
        
        foreach ($categories as $category) {
            if (str_contains(strtolower($content), $category)) {
                return $category;
            }
        }

        // Infer category from filename
        if (str_contains($content, 'crop')) {
            return 'crop';
        } elseif (str_contains($content, 'land')) {
            return 'land';
        } elseif (str_contains($content, 'member')) {
            return 'member';
        } elseif (str_contains($content, 'produce')) {
            return 'harvest';
        } else {
            return 'other';
        }
    }

    /**
     * Extract description from content
     */
    private static function extractDescription(string $content): string
    {
        $patterns = [
            '/description\s*[:=]\s*["\']([^"\']+)["\']/',
            '/FormDescription\s*[:=]\s*["\']([^"\']+)["\']/',
            '/<p[^>]*>([^<]+)<\/p>/',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $content, $matches)) {
                return trim($matches[1]);
            }
        }

        return '';
    }

    /**
     * Extract form fields from content
     */
    private static function extractFields(string $content): array
    {
        $fields = [];
        
        // Look for form field patterns in the formData interface or form fields
        $fieldPatterns = [
            // Look for form field definitions in the interface
            '/interface\s+FormData\s*\{([^}]+)\}/s',
            // Look for form field definitions in useState
            '/useState<FormData>\(\(\{([^}]+)\}\)/s',
            // Look for form field definitions in the form
            '/formData\s*[:=]\s*\{([^}]+)\}/s',
        ];

        foreach ($fieldPatterns as $pattern) {
            if (preg_match($pattern, $content, $matches)) {
                $fieldContent = $matches[1];
                
                // Extract field names from the content
                if (preg_match_all('/(\w+)\s*:\s*["\']?[^"\',\s]+["\']?/', $fieldContent, $fieldMatches)) {
                    foreach ($fieldMatches[1] as $fieldName) {
                        // Skip common non-field properties
                        if (in_array($fieldName, ['id', 'title', 'type', 'category', 'description', 'status', 'target_roles', 'created_at', 'updated_at'])) {
                            continue;
                        }
                        
                        // Skip validation-related properties
                        if (str_contains($fieldName, 'error') || str_contains($fieldName, 'required') || str_contains($fieldName, 'valid')) {
                            continue;
                        }
                        
                        $fields[] = [
                            'name' => $fieldName,
                            'type' => 'text', // Default type
                            'label' => Str::title(str_replace(['_', '-'], ' ', $fieldName)),
                            'required' => false,
                            'placeholder' => '',
                            'description' => '',
                        ];
                    }
                }
            }
        }

        // If no fields found in patterns, try to extract from form inputs
        if (empty($fields)) {
            // Look for input fields with name attributes
            if (preg_match_all('/name\s*[:=]\s*["\']([^"\']+)["\']/', $content, $matches)) {
                foreach ($matches[1] as $name) {
                    // Skip common non-field names
                    if (in_array($name, ['form-title', 'form-type', 'form-category', 'form-description', 'csrf_token'])) {
                        continue;
                    }
                    
                    // Skip validation error messages
                    if (str_contains($name, 'error') || str_contains($name, 'required') || str_contains($name, 'valid')) {
                        continue;
                    }
                    
                    $fields[] = [
                        'name' => $name,
                        'type' => 'text',
                        'label' => Str::title(str_replace(['_', '-'], ' ', $name)),
                        'required' => false,
                        'placeholder' => '',
                        'description' => '',
                    ];
                }
            }
        }

        return $fields;
    }

    /**
     * Extract target roles from content
     */
    private static function extractTargetRoles(string $content): array
    {
        $roles = ['unit_leader'];
        
        if (str_contains($content, 'member')) {
            $roles[] = 'member';
        }
        
        if (str_contains($content, 'admin')) {
            $roles[] = 'admin';
        }

        return $roles;
    }

    /**
     * Sync forms from the leaders folder to the database
     */
    public static function syncForms(): array
    {
        $availableForms = self::getAvailableForms();
        $synced = [];
        $errors = [];

        foreach ($availableForms as $formData) {
            try {
                $form = Form::updateOrCreate(
                    ['name' => $formData['name']],
                    [
                        'title' => $formData['title'],
                        'type' => $formData['type'],
                        'category' => $formData['category'],
                        'description' => $formData['description'],
                        'fields' => $formData['fields'],
                        'target_roles' => $formData['target_roles'],
                        'status' => 'active',
                        'user_id' => auth()->check() ? auth()->user()->id : 1,
                    ]
                );

                $synced[] = $form;
            } catch (\Exception $e) {
                $errors[] = [
                    'form' => $formData['name'],
                    'error' => $e->getMessage()
                ];
                Log::error('Error syncing form: ' . $e->getMessage(), ['form' => $formData['name']]);
            }
        }

        return [
            'synced' => $synced,
            'errors' => $errors,
            'total_available' => count($availableForms),
            'total_synced' => count($synced),
            'total_errors' => count($errors),
        ];
    }

    /**
     * Get form statistics
     */
    public static function getFormStats(): array
    {
        $availableForms = self::getAvailableForms();
        $dbForms = Form::all();

        return [
            'total_available' => count($availableForms),
            'total_in_db' => $dbForms->count(),
            'active_forms' => $dbForms->where('status', 'active')->count(),
            'draft_forms' => $dbForms->where('status', 'draft')->count(),
            'inactive_forms' => $dbForms->where('status', 'inactive')->count(),
            'by_type' => $dbForms->groupBy('type')->map->count(),
            'by_category' => $dbForms->groupBy('category')->map->count(),
            'by_target_role' => [
                'unit_leader' => $dbForms->filter(fn($f) => in_array('unit_leader', $f->target_roles ?? []))->count(),
                'member' => $dbForms->filter(fn($f) => in_array('member', $f->target_roles ?? []))->count(),
                'admin' => $dbForms->filter(fn($f) => in_array('admin', $f->target_roles ?? []))->count(),
            ],
        ];
    }
} 