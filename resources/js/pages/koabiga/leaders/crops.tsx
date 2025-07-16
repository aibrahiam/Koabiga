import { Head } from '@inertiajs/react';
import { 
    Sprout, 
    Search, 
    Filter, 
    Plus,
    Edit,
    Eye,
    Calendar,
    TrendingUp,
    Droplets,
    Sun,
    Users,
    Package
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Unit Leader Dashboard',
        href: '/koabiga/leaders/dashboard',
    },
    {
        title: 'Crop Management',
        href: '/koabiga/leaders/crops',
    },
];

export default function UnitLeaderCrops() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crop Management - Koabiga" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Crop Management</h1>
                    <p className="text-gray-600 dark:text-gray-400">Monitor and manage unit crop production</p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sprout className="h-5 w-5 text-green-600 dark:text-green-400" />
                            Crop Management
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Your crop management interface will be displayed here.</p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 