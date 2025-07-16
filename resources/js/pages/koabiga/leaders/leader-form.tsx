import { Head, router, Link } from '@inertiajs/react';
import { 
    ClipboardList, 
    Search, 
    Filter, 
    Plus,
    Edit,
    Eye,
    Download,
    Calendar,
    Users,
    FileText,
    AlertTriangle,
    LoaderCircle,
    Building2,
    UserCheck,
    UserPlus,
    MapPin,
    Sprout,
    Package
} from 'lucide-react';

import UnitLeaderLayout from '@/layouts/unit-leader-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Unit Leader Dashboard',
        href: '/koabiga/leaders/dashboard',
    },
    {
        title: 'Forms',
        href: '/koabiga/leaders/forms',
    },
];

// Predefined forms for unit leaders
const unitLeaderForms = [
    {
        id: 'member-creation',
        title: 'Member Creation Form',
        description: 'Add new members to your unit',
        type: 'registration',
        category: 'member',
        icon: UserPlus,
        color: 'bg-blue-100 text-blue-800',
        borderColor: 'border-blue-200',
        href: '/koabiga/leaders/forms/member-creation'
    },
    {
        id: 'land-assignment',
        title: 'Land Assignment Form',
        description: 'Assign land plots to unit members',
        type: 'request',
        category: 'land',
        icon: MapPin,
        color: 'bg-green-100 text-green-800',
        borderColor: 'border-green-200',
        href: '/koabiga/leaders/forms/land-assignment'
    },
    {
        id: 'crop-creation',
        title: 'Create Crop Form',
        description: 'Add new crops to the unit',
        type: 'registration',
        category: 'crop',
        icon: Sprout,
        color: 'bg-orange-100 text-orange-800',
        borderColor: 'border-orange-200',
        href: '/koabiga/leaders/forms/crop-creation'
    },
    {
        id: 'produce-creation',
        title: 'Create Produce Form',
        description: 'Record produce output from the unit',
        type: 'report',
        category: 'harvest',
        icon: Package,
        color: 'bg-purple-100 text-purple-800',
        borderColor: 'border-purple-200',
        href: '/koabiga/leaders/forms/produce-creation'
    }
];

export default function UnitLeaderForms() {
    const [forms, setForms] = useState<any[]>([]);
    const [assignedForms, setAssignedForms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [assignedFormsLoading, setAssignedFormsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');

    const fetchForms = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await axios.get('/api/leaders/forms?target_roles=unit_leader&status=active');
            
            if (response.data.success) {
                const formsData = response.data.data;
                if (formsData && formsData.data) {
                    setForms(formsData.data || []);
                } else {
                    setForms(formsData || []);
                }
            } else {
                setError(response.data.message || 'Failed to fetch forms');
                setForms([]);
            }
        } catch (err: any) {
            console.error('Error fetching forms:', err);
            console.error('Error details:', err.response?.data);
            setError('Failed to fetch forms');
            setForms([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchAssignedForms = async () => {
        try {
            setAssignedFormsLoading(true);
            setError(null);
            
            const response = await axios.get('/api/leaders/assigned-forms');
            
            if (response.data.success) {
                const formsData = response.data.data;
                if (formsData && formsData.data) {
                    setAssignedForms(formsData.data || []);
                } else {
                    setAssignedForms(formsData || []);
                }
            } else {
                console.log('No assigned forms found or error:', response.data.message);
                setAssignedForms([]);
            }
        } catch (err: any) {
            console.error('Error fetching assigned forms:', err);
            setAssignedForms([]);
        } finally {
            setAssignedFormsLoading(false);
        }
    };

    useEffect(() => {
        fetchForms();
        fetchAssignedForms();
    }, []);

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'request':
                return <Badge variant="outline" className="border-blue-200 text-blue-700">Request</Badge>;
            case 'registration':
                return <Badge variant="outline" className="border-green-200 text-green-700">Registration</Badge>;
            case 'report':
                return <Badge variant="outline" className="border-orange-200 text-orange-700">Report</Badge>;
            case 'application':
                return <Badge variant="outline" className="border-purple-200 text-purple-700">Application</Badge>;
            default:
                return <Badge variant="outline">{type}</Badge>;
        }
    };

    const getCategoryBadge = (category: string) => {
        switch (category) {
            case 'land':
                return <Badge variant="outline" className="border-purple-200 text-purple-700">Land</Badge>;
            case 'crop':
                return <Badge variant="outline" className="border-green-200 text-green-700">Crop</Badge>;
            case 'equipment':
                return <Badge variant="outline" className="border-gray-200 text-gray-700">Equipment</Badge>;
            case 'member':
                return <Badge variant="outline" className="border-blue-200 text-blue-700">Member</Badge>;
            case 'harvest':
                return <Badge variant="outline" className="border-orange-200 text-orange-700">Harvest</Badge>;
            case 'financial':
                return <Badge variant="outline" className="border-red-200 text-red-700">Financial</Badge>;
            default:
                return <Badge variant="outline">{category}</Badge>;
        }
    };

    const filteredForms = forms.filter(form => {
        const matchesSearch = form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            form.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || form.type === filterType;
        const matchesCategory = filterCategory === 'all' || form.category === filterCategory;
        
        return matchesSearch && matchesType && matchesCategory;
    });

    return (
        <UnitLeaderLayout breadcrumbs={breadcrumbs}>
            <Head title="Forms - Unit Leader Dashboard" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Unit Leader Forms</h1>
                        <p className="text-gray-600 dark:text-gray-400">Access and manage forms for your unit</p>
                    </div>
                </div>

                {/* Quick Access Forms */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Access Forms</CardTitle>
                        <CardDescription>Common forms for unit management</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 grid-cols-2 sm:gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
                            {unitLeaderForms.map((form) => {
                                const IconComponent = form.icon;
                                return (
                                    <Link key={form.id} href={form.href} className="contents">
                                        <Card 
                                            className={`cursor-pointer hover:shadow-md transition-shadow ${form.borderColor}`}
                                        >
                                            <CardContent className="p-3 sm:p-4 md:p-6">
                                                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                                                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${form.color} flex items-center justify-center mx-auto sm:mx-0`}>
                                                        <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" />
                                                    </div>
                                                    <div className="flex-1 text-center sm:text-left">
                                                        <h3 className="font-medium text-xs sm:text-sm">{form.title}</h3>
                                                        <p className="text-xs text-muted-foreground hidden sm:block">{form.description}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Newly Assigned Forms */}
                <Card>
                    <CardHeader>
                        <CardTitle>Newly Assigned Forms</CardTitle>
                        <CardDescription>Forms specifically assigned to your unit by administrators</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {assignedFormsLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <LoaderCircle className="h-6 w-6 animate-spin text-muted-foreground" />
                                <span className="ml-2 text-sm text-muted-foreground">Loading assigned forms...</span>
                            </div>
                        ) : assignedForms.length > 0 ? (
                            <div className="grid gap-3 grid-cols-1 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {assignedForms.map((form) => (
                                    <Card key={form.id} className="hover:shadow-md transition-shadow border-blue-200 bg-blue-50/50">
                                        <CardContent className="p-3 sm:p-4 md:p-6">
                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4">
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-sm mb-1">{form.title}</h3>
                                                    <p className="text-xs text-muted-foreground mb-2 hidden sm:block">{form.description}</p>
                                                    <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                                                        {getTypeBadge(form.type)}
                                                        {getCategoryBadge(form.category)}
                                                        <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-100">
                                                            Assigned
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                                                <span className="text-xs text-muted-foreground">
                                                    Assigned: {new Date(form.created_at).toLocaleDateString()}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                                        <Eye className="h-3 w-3 mr-1" />
                                                        View
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">No Assigned Forms</h3>
                                <p className="text-sm text-muted-foreground">
                                    No forms have been specifically assigned to your unit yet.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* All Forms */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Forms</CardTitle>
                        <CardDescription>All available forms for unit leaders</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <LoaderCircle className="h-6 w-6 animate-spin text-muted-foreground" />
                                <span className="ml-2 text-sm text-muted-foreground">Loading forms...</span>
                            </div>
                        ) : filteredForms.length > 0 ? (
                            <div className="grid gap-3 grid-cols-1 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {filteredForms.map((form) => (
                                    <Card key={form.id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-3 sm:p-4 md:p-6">
                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4">
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-sm mb-1">{form.title}</h3>
                                                    <p className="text-xs text-muted-foreground mb-2 hidden sm:block">{form.description}</p>
                                                    <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                                                        {getTypeBadge(form.type)}
                                                        {getCategoryBadge(form.category)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                                                <span className="text-xs text-muted-foreground">
                                                    Created: {new Date(form.created_at).toLocaleDateString()}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                                        <Eye className="h-3 w-3 mr-1" />
                                                        View
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">No Forms Available</h3>
                                <p className="text-sm text-muted-foreground">
                                    No forms have been created for unit leaders yet.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </UnitLeaderLayout>
    );
}