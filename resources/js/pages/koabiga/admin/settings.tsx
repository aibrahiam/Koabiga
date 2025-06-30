import { Head } from '@inertiajs/react';
import { 
    Settings, 
    Save,
    Users,
    Shield,
    Database,
    Bell,
    Globe
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/koabiga/admin/dashboard',
    },
    {
        title: 'Settings',
        href: '/koabiga/admin/settings',
    },
];

export default function AdminSettings() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Settings - Koabiga" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Settings</h1>
                        <p className="text-gray-600 dark:text-gray-400">Configure platform settings and preferences</p>
                    </div>
                    <Button className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        Save Changes
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* General Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5" />
                                General Settings
                            </CardTitle>
                            <CardDescription>Basic platform configuration</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="platform-name">Platform Name</Label>
                                <Input id="platform-name" defaultValue="Koabiga Agriculture Platform" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="admin-email">Admin Email</Label>
                                <Input id="admin-email" type="email" defaultValue="admin@koabiga.com" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="timezone">Timezone</Label>
                                <Select defaultValue="utc">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select timezone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="utc">UTC</SelectItem>
                                        <SelectItem value="est">Eastern Time</SelectItem>
                                        <SelectItem value="pst">Pacific Time</SelectItem>
                                        <SelectItem value="gmt">GMT</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Platform Description</Label>
                                <Textarea 
                                    id="description" 
                                    defaultValue="Koabiga is a comprehensive agriculture management platform designed to streamline farming operations, improve productivity, and enhance collaboration among agricultural units."
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* User Management Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                User Management
                            </CardTitle>
                            <CardDescription>User registration and role settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Allow User Registration</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Enable public user registration
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Email Verification Required</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Require email verification for new users
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Auto-assign Unit Leader Role</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Automatically assign unit leader role to new registrations
                                    </p>
                                </div>
                                <Switch />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="max-members">Maximum Members per Unit</Label>
                                <Input id="max-members" type="number" defaultValue="20" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Security Settings
                            </CardTitle>
                            <CardDescription>Platform security configuration</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Two-Factor Authentication</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Require 2FA for all users
                                    </p>
                                </div>
                                <Switch />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Session Timeout</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Auto-logout after inactivity
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                                <Input id="session-timeout" type="number" defaultValue="30" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password-min-length">Minimum Password Length</Label>
                                <Input id="password-min-length" type="number" defaultValue="8" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notification Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                Notification Settings
                            </CardTitle>
                            <CardDescription>Configure system notifications</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Email Notifications</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Send email notifications for important events
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Report Reminders</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Send reminders for pending reports
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Task Notifications</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Notify about new task assignments
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notification-email">Notification Email</Label>
                                <Input id="notification-email" type="email" defaultValue="notifications@koabiga.com" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Data Management */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="h-5 w-5" />
                                Data Management
                            </CardTitle>
                            <CardDescription>Data backup and maintenance</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Auto Backup</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Automatically backup data daily
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="backup-retention">Backup Retention (days)</Label>
                                <Input id="backup-retention" type="number" defaultValue="30" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="data-export">Data Export Format</Label>
                                <Select defaultValue="csv">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select format" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="csv">CSV</SelectItem>
                                        <SelectItem value="json">JSON</SelectItem>
                                        <SelectItem value="excel">Excel</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button variant="outline" className="w-full">
                                Export All Data
                            </Button>
                        </CardContent>
                    </Card>

                    {/* System Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                System Information
                            </CardTitle>
                            <CardDescription>Platform version and status</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Platform Version</Label>
                                <p className="text-sm text-muted-foreground">Koabiga v1.0.0</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Last Updated</Label>
                                <p className="text-sm text-muted-foreground">June 27, 2024</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Database Status</Label>
                                <p className="text-sm text-green-600">Connected</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Storage Usage</Label>
                                <p className="text-sm text-muted-foreground">2.4 GB / 10 GB</p>
                            </div>
                            <Button variant="outline" className="w-full">
                                Check for Updates
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
} 