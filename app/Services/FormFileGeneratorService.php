<?php

namespace App\Services;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class FormFileGeneratorService
{
    protected $formsDirectory;
    protected $templatePath;

    public function __construct()
    {
        $this->formsDirectory = resource_path('js/pages/koabiga/unit-leader/forms');
        $this->templatePath = resource_path('js/templates/form-template.tsx');
    }

    /**
     * Generate a TypeScript form component file
     */
    public function generateFormFile(array $formData): bool
    {
        try {
            $fileName = $this->generateFileName($formData['title']);
            $filePath = $this->formsDirectory . '/' . $fileName . '.tsx';
            
            $content = $this->generateFormContent($formData);
            
            // Ensure directory exists
            if (!File::exists($this->formsDirectory)) {
                File::makeDirectory($this->formsDirectory, 0755, true);
            }
            
            // Write the file
            File::put($filePath, $content);
            
            return true;
        } catch (\Exception $e) {
            \Log::error('Form file generation failed: ' . $e->getMessage(), [
                'form_data' => $formData,
                'file_path' => $filePath ?? null
            ]);
            return false;
        }
    }

    /**
     * Update an existing form file
     */
    public function updateFormFile(array $formData, ?string $oldTitle = null): bool
    {
        try {
            $newFileName = $this->generateFileName($formData['title']);
            $newFilePath = $this->formsDirectory . '/' . $newFileName . '.tsx';
            
            // If title changed, delete old file
            if ($oldTitle && $oldTitle !== $formData['title']) {
                $oldFileName = $this->generateFileName($oldTitle);
                $oldFilePath = $this->formsDirectory . '/' . $oldFileName . '.tsx';
                
                if (File::exists($oldFilePath)) {
                    File::delete($oldFilePath);
                }
            }
            
            $content = $this->generateFormContent($formData);
            File::put($newFilePath, $content);
            
            return true;
        } catch (\Exception $e) {
            \Log::error('Form file update failed: ' . $e->getMessage(), [
                'form_data' => $formData,
                'old_title' => $oldTitle
            ]);
            return false;
        }
    }

    /**
     * Delete a form file
     */
    public function deleteFormFile(string $title): bool
    {
        try {
            $fileName = $this->generateFileName($title);
            $filePath = $this->formsDirectory . '/' . $fileName . '.tsx';
            
            if (File::exists($filePath)) {
                File::delete($filePath);
                return true;
            }
            
            return false;
        } catch (\Exception $e) {
            \Log::error('Form file deletion failed: ' . $e->getMessage(), [
                'title' => $title,
                'file_path' => $filePath ?? null
            ]);
            return false;
        }
    }

    /**
     * Generate file name from title
     */
    protected function generateFileName(string $title): string
    {
        return Str::kebab(Str::lower($title));
    }

    /**
     * Generate form component content
     */
    protected function generateFormContent(array $formData): string
    {
        $componentName = Str::studly($formData['title']);
        $fields = $this->generateFieldsCode($formData['fields']);
        $validation = $this->generateValidationCode($formData['fields']);
        $formState = $this->generateFormState($formData['fields']);
        
        return $this->getFormTemplate([
            'componentName' => $componentName,
            'formTitle' => $formData['title'],
            'formDescription' => $formData['description'] ?? '',
            'fields' => $fields,
            'validation' => $validation,
            'formState' => $formState,
            'category' => $formData['category'],
            'type' => $formData['type']
        ]);
    }

    /**
     * Generate fields code
     */
    protected function generateFieldsCode(array $fields): string
    {
        $fieldsCode = '';
        
        foreach ($fields as $field) {
            $fieldCode = $this->generateFieldCode($field);
            $fieldsCode .= $fieldCode . "\n\n";
        }
        
        return trim($fieldsCode);
    }

    /**
     * Generate individual field code
     */
    protected function generateFieldCode(array $field): string
    {
        $name = $field['name'];
        $label = $field['label'];
        $type = $field['type'];
        $required = $field['required'] ?? false;
        $placeholder = $field['placeholder'] ?? '';
        $description = $field['description'] ?? '';
        
        $requiredAttr = $required ? 'required' : '';
        $placeholderAttr = $placeholder ? "placeholder=\"{$placeholder}\"" : '';
        $descriptionHtml = $description ? "<p className=\"text-sm text-muted-foreground mt-1\">{$description}</p>" : '';
        
        switch ($type) {
            case 'textarea':
                return <<<HTML
                <div className="space-y-2">
                    <Label htmlFor="{$name}">{$label}</Label>
                    <Textarea
                        id="{$name}"
                        name="{$name}"
                        value={formData.{$name}}
                        onChange={(e) => setFormData(prev => ({ ...prev, {$name}: e.target.value }))}
                        {$requiredAttr}
                        {$placeholderAttr}
                    />
                    {formErrors.{$name} && (
                        <p className="text-sm text-red-600">{formErrors.{$name}}</p>
                    )}
                    {$descriptionHtml}
                </div>
HTML;
                
            case 'select':
                $options = $field['options'] ?? [];
                $optionsHtml = '';
                foreach ($options as $option) {
                    $optionsHtml .= "<option value=\"{$option}\">{$option}</option>\n";
                }
                
                return <<<HTML
                <div className="space-y-2">
                    <Label htmlFor="{$name}">{$label}</Label>
                    <Select 
                        value={formData.{$name}} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, {$name}: value }))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="{$placeholder}" />
                        </SelectTrigger>
                        <SelectContent>
                            {$optionsHtml}
                        </SelectContent>
                    </Select>
                    {formErrors.{$name} && (
                        <p className="text-sm text-red-600">{formErrors.{$name}}</p>
                    )}
                    {$descriptionHtml}
                </div>
HTML;
                
            case 'checkbox':
                return <<<HTML
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="{$name}"
                        name="{$name}"
                        checked={formData.{$name}}
                        onChange={(e) => setFormData(prev => ({ ...prev, {$name}: e.target.checked }))}
                        className="rounded border-gray-300"
                    />
                    <Label htmlFor="{$name}">{$label}</Label>
                </div>
                {formErrors.{$name} && (
                    <p className="text-sm text-red-600">{formErrors.{$name}}</p>
                )}
                {$descriptionHtml}
HTML;
                
            case 'date':
                return <<<HTML
                <div className="space-y-2">
                    <Label htmlFor="{$name}">{$label}</Label>
                    <Input
                        type="date"
                        id="{$name}"
                        name="{$name}"
                        value={formData.{$name}}
                        onChange={(e) => setFormData(prev => ({ ...prev, {$name}: e.target.value }))}
                        {$requiredAttr}
                    />
                    {formErrors.{$name} && (
                        <p className="text-sm text-red-600">{formErrors.{$name}}</p>
                    )}
                    {$descriptionHtml}
                </div>
HTML;
                
            default: // text, email, number
                $inputType = in_array($type, ['email', 'number']) ? $type : 'text';
                return <<<HTML
                <div className="space-y-2">
                    <Label htmlFor="{$name}">{$label}</Label>
                    <Input
                        type="{$inputType}"
                        id="{$name}"
                        name="{$name}"
                        value={formData.{$name}}
                        onChange={(e) => setFormData(prev => ({ ...prev, {$name}: e.target.value }))}
                        {$requiredAttr}
                        {$placeholderAttr}
                    />
                    {formErrors.{$name} && (
                        <p className="text-sm text-red-600">{formErrors.{$name}}</p>
                    )}
                    {$descriptionHtml}
                </div>
HTML;
        }
    }

    /**
     * Generate validation code
     */
    protected function generateValidationCode(array $fields): string
    {
        $validationCode = "const errors: Record<string, string> = {};\n\n";
        
        foreach ($fields as $field) {
            $name = $field['name'];
            $label = $field['label'];
            $required = $field['required'] ?? false;
            $type = $field['type'];
            
            if ($required) {
                $validationCode .= "if (!formData.{$name} || formData.{$name}.toString().trim() === '') {\n";
                $validationCode .= "    errors.{$name} = '{$label} is required';\n";
                $validationCode .= "}\n\n";
            }
            
            // Add type-specific validation
            if ($type === 'email' && $required) {
                $validationCode .= "if (formData.{$name} && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+\$/.test(formData.{$name})) {\n";
                $validationCode .= "    errors.{$name} = 'Please enter a valid email address';\n";
                $validationCode .= "}\n\n";
            }
            
            if ($type === 'number' && $required) {
                $validationCode .= "if (formData.{$name} && isNaN(Number(formData.{$name}))) {\n";
                $validationCode .= "    errors.{$name} = 'Please enter a valid number';\n";
                $validationCode .= "}\n\n";
            }
        }
        
        return $validationCode;
    }

    /**
     * Generate form state
     */
    protected function generateFormState(array $fields): string
    {
        $stateCode = "const [formData, setFormData] = useState({\n";
        
        foreach ($fields as $field) {
            $name = $field['name'];
            $type = $field['type'];
            
            switch ($type) {
                case 'checkbox':
                    $stateCode .= "    {$name}: false,\n";
                    break;
                case 'date':
                    $stateCode .= "    {$name}: new Date().toISOString().split('T')[0],\n";
                    break;
                default:
                    $stateCode .= "    {$name}: '',\n";
            }
        }
        
        $stateCode .= "});";
        
        return $stateCode;
    }

    /**
     * Get form template
     */
    protected function getFormTemplate(array $data): string
    {
        return <<<TSX
import { Head, router } from '@inertiajs/react';
import { 
    Save,
    X,
    ArrowLeft,
    LoaderCircle,
    AlertTriangle,
    CheckCircle,
    FileText
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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Unit Leader Dashboard',
        href: '/koabiga/unit-leader/dashboard',
    },
    {
        title: 'Forms',
        href: '/koabiga/unit-leader/forms',
    },
    {
        title: '{$data['formTitle']}',
        href: '/koabiga/unit-leader/forms/{$data['componentName']}',
    },
];

export default function {$data['componentName']}Form() {
    {$data['formState']}
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const validateForm = (): boolean => {
        {$data['validation']}
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        try {
            setLoading(true);
            setError(null);
            
            const response = await axios.post('/api/unit-leader/forms/submit', {
                form_type: '{$data['componentName']}',
                form_data: formData,
                category: '{$data['category']}',
                type: '{$data['type']}'
            });
            
            if (response.data.success) {
                setSuccess('Form submitted successfully!');
                setTimeout(() => {
                    router.visit('/koabiga/unit-leader/forms');
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
        router.visit('/koabiga/unit-leader/forms');
    };

    return (
        <UnitLeaderLayout breadcrumbs={breadcrumbs}>
            <Head title="{$data['formTitle']} - Koabiga Unit Leader" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{$data['formTitle']}</h1>
                        <p className="text-gray-600 dark:text-gray-400">{$data['formDescription']}</p>
                    </div>
                    <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Forms
                    </Button>
                </div>

                {/* Alerts */}
                {error && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {success && (
                    <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800 dark:text-green-200">{success}</AlertDescription>
                    </Alert>
                )}

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            {$data['formTitle']}
                        </CardTitle>
                        <CardDescription>
                            Please fill out all required fields below
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {$data['fields']}
                            
                            <div className="flex justify-end space-x-2 pt-6">
                                <Button variant="outline" onClick={handleCancel} type="button">
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? (
                                        <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4 mr-2" />
                                    )}
                                    Submit Form
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </UnitLeaderLayout>
    );
}
TSX;
    }
} 