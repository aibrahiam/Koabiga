import { Head, router } from '@inertiajs/react';
import { 
    ArrowLeft,
    Save,
    X,
    LoaderCircle,
    AlertTriangle,
    CheckCircle
} from 'lucide-react';
import { useState } from 'react';
import axios from '@/lib/axios';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';

interface Page {
    id: number;
    title: string;
    path: string;
    role: string;
    status: string;
    description: string;
    icon: string;
    sort_order: number;
    is_public: boolean;
    features: string[];
    permissions: string[];
}

interface EditPageProps {
    page: Page;
}

export default function EditPage({ page }: EditPageProps) {
    const [pageData, setPageData] = useState<Page>(page);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const breadcrumbs = [
        {
            title: 'Admin Dashboard',
            href: '/koabiga/admin/dashboard',
        },
        {
            title: 'Page Management',
            href: '/koabiga/admin/page-management',
        },
        {
            title: `Edit ${page.title}`,
            href: `/koabiga/admin/pages/${page.id}/edit`,
        },
    ];

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);

            const response = await axios.put(`/api/admin/pages/${page.id}`, pageData);
            
            if (response.data.success) {
                setSuccess('Page updated successfully!');
                setTimeout(() => {
                    router.visit('/koabiga/admin/page-management');
                }, 1500);
            } else {
                setError(response.data.message || 'Failed to update page');
            }
        } catch (err: any) {
            console.error('Error updating page:', err);
            setError(err.response?.data?.message || 'Failed to update page. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        router.visit('/koabiga/admin/page-management');
    };

    const clearMessages = () => {
        setError(null);
        setSuccess(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${page.title} - Koabiga Admin`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleCancel}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Page</h1>
                            <p className="text-gray-600 dark:text-gray-400">Update page settings and configuration</p>
                        </div>
                    </div>
                </div>

                {/* Success/Error Messages */}
                {success && (
                    <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <AlertDescription className="text-green-800 dark:text-green-200">
                            {success}
                        </AlertDescription>
                        <Button variant="ghost" size="sm" onClick={clearMessages} className="ml-auto">
                            <X className="h-4 w-4" />
                        </Button>
                    </Alert>
                )}

                {error && (
                    <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <AlertDescription className="text-red-800 dark:text-red-200">
                            {error}
                        </AlertDescription>
                        <Button variant="ghost" size="sm" onClick={clearMessages} className="ml-auto">
                            <X className="h-4 w-4" />
                        </Button>
                    </Alert>
                )}

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Page Information</CardTitle>
                        <CardDescription>Update the page details and settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Page Title *</Label>
                                <Input
                                    id="title"
                                    value={pageData.title}
                                    onChange={(e) => setPageData({...pageData, title: e.target.value})}
                                    placeholder="Enter page title"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="path">Page Path *</Label>
                                <Input
                                    id="path"
                                    value={pageData.path}
                                    onChange={(e) => setPageData({...pageData, path: e.target.value})}
                                    placeholder="/koabiga/example/page"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="role">Role *</Label>
                                <Select 
                                    value={pageData.role} 
                                    onValueChange={(value) => setPageData({...pageData, role: value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="unit_leader">Unit Leader</SelectItem>
                                        <SelectItem value="member">Member</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status *</Label>
                                <Select 
                                    value={pageData.status} 
                                    onValueChange={(value) => setPageData({...pageData, status: value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sort_order">Sort Order</Label>
                                <Input
                                    id="sort_order"
                                    type="number"
                                    value={pageData.sort_order}
                                    onChange={(e) => setPageData({...pageData, sort_order: parseInt(e.target.value) || 0})}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={pageData.description}
                                onChange={(e) => setPageData({...pageData, description: e.target.value})}
                                placeholder="Enter page description"
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="icon">Icon Name</Label>
                            <Input
                                id="icon"
                                value={pageData.icon}
                                onChange={(e) => setPageData({...pageData, icon: e.target.value})}
                                placeholder="e.g., FileText, Users, Settings"
                            />
                            <p className="text-xs text-muted-foreground">
                                Use Lucide React icon names (e.g., FileText, Users, Settings, MapPin)
                            </p>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="is_public"
                                checked={pageData.is_public}
                                onCheckedChange={(checked) => setPageData({...pageData, is_public: checked})}
                            />
                            <Label htmlFor="is_public">Public Page</Label>
                        </div>

                        <div className="flex justify-end space-x-2 pt-6">
                            <Button variant="outline" onClick={handleCancel}>
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={saving || !pageData.title || !pageData.path}>
                                {saving ? (
                                    <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                )}
                                Update Page
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 