import { Head, router } from '@inertiajs/react';
import { 
    User, 
    Shield, 
    Bell, 
    Palette, 
    Save,
    LoaderCircle,
    AlertTriangle,
    CheckCircle,
    ArrowLeft
} from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';

import UnitLeaderLayout from '@/layouts/unit-leader-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useInitials } from '@/hooks/use-initials';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Unit Leader Dashboard',
        href: '/koabiga/leaders/dashboard',
    },
    {
        title: 'Settings',
        href: '/koabiga/leaders/settings',
    },
];

interface ProfileData {
    christian_name: string;
    family_name: string;
    email: string;
    phone: string;
    id_passport: string;
    bio: string;
}

interface PasswordData {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
}

interface NotificationSettings {
    email_notifications: boolean;
    sms_notifications: boolean;
    activity_alerts: boolean;
    report_reminders: boolean;
}

export default function UnitLeaderSettings() {
    const { user } = useAuth();
    const getInitials = useInitials();
    
    const [profileData, setProfileData] = useState<ProfileData>({
        christian_name: '',
        family_name: '',
        email: '',
        phone: '',
        id_passport: '',
        bio: ''
    });
    
    const [passwordData, setPasswordData] = useState<PasswordData>({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    });
    
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
        email_notifications: true,
        sms_notifications: true,
        activity_alerts: true,
        report_reminders: true
    });
    
    const [loading, setLoading] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
    const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (user) {
            setProfileData({
                christian_name: user?.christian_name || '',
                family_name: user?.family_name || '',
                email: user?.email || '',
                phone: user?.phone || '',
                id_passport: (user as any)?.id_passport || '',
                bio: (user as any)?.bio || ''
            });
        }
    }, [user]);

    const validateProfile = (): boolean => {
        const errors: Record<string, string> = {};

        if (!profileData.christian_name.trim()) {
            errors.christian_name = 'Christian name is required';
        }

        if (!profileData.family_name.trim()) {
            errors.family_name = 'Family name is required';
        }

        if (profileData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (profileData.phone && !/^07\d{8}$/.test(profileData.phone.replace(/\s/g, ''))) {
            errors.phone = 'Please enter a valid Rwandan phone number (07XXXXXXXX)';
        }

        setProfileErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validatePassword = (): boolean => {
        const errors: Record<string, string> = {};

        if (!passwordData.current_password) {
            errors.current_password = 'Current password is required';
        }

        if (!passwordData.new_password) {
            errors.new_password = 'New password is required';
        } else if (passwordData.new_password.length < 8) {
            errors.new_password = 'Password must be at least 8 characters';
        }

        if (passwordData.new_password !== passwordData.new_password_confirmation) {
            errors.new_password_confirmation = 'Passwords do not match';
        }

        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateProfile()) {
            return;
        }

        try {
            setProfileLoading(true);
            setError(null);
            setSuccess(null);

            const response = await axios.put('/api/leaders/profile', profileData);

            if (response.data.success) {
                setSuccess('Profile updated successfully!');
                setProfileErrors({});
            } else {
                setError(response.data.message || 'Failed to update profile');
            }
        } catch (err: any) {
            console.error('Error updating profile:', err);
            if (err.response?.data?.errors) {
                const errorMessages = Object.values(err.response.data.errors).flat();
                setError(errorMessages.join(', '));
            } else {
                setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
            }
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validatePassword()) {
            return;
        }

        try {
            setPasswordLoading(true);
            setError(null);
            setSuccess(null);

            const response = await axios.put('/api/leaders/password', passwordData);

            if (response.data.success) {
                setSuccess('Password updated successfully!');
                setPasswordData({
                    current_password: '',
                    new_password: '',
                    new_password_confirmation: ''
                });
                setPasswordErrors({});
            } else {
                setError(response.data.message || 'Failed to update password');
            }
        } catch (err: any) {
            console.error('Error updating password:', err);
            if (err.response?.data?.errors) {
                const errorMessages = Object.values(err.response.data.errors).flat();
                setError(errorMessages.join(', '));
            } else {
                setError(err.response?.data?.message || 'Failed to update password. Please try again.');
            }
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleNotificationSettingsUpdate = async () => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            const response = await axios.put('/api/leaders/notifications', notificationSettings);

            if (response.data.success) {
                setSuccess('Notification settings updated successfully!');
            } else {
                setError(response.data.message || 'Failed to update notification settings');
            }
        } catch (err: any) {
            console.error('Error updating notification settings:', err);
            setError(err.response?.data?.message || 'Failed to update notification settings');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.visit('/koabiga/leaders/dashboard');
    };

    return (
        <UnitLeaderLayout breadcrumbs={breadcrumbs}>
            <Head title="Settings - Unit Leader" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button onClick={handleCancel} variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Dashboard
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
                            <p className="text-gray-600 dark:text-gray-400">Manage your account and preferences</p>
                        </div>
                    </div>
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

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Settings */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Profile Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Profile Information
                                </CardTitle>
                                <CardDescription>Update your personal information</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleProfileUpdate} className="space-y-4">
                                    <div className="flex items-center gap-4 mb-6">
                                        <Avatar className="h-16 w-16">
                                            <AvatarImage src={user?.avatar || undefined} alt={user?.name} />
                                            <AvatarFallback className="text-lg">
                                                {getInitials(user?.name || '')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-medium">{user?.name}</h3>
                                            <p className="text-sm text-muted-foreground">Unit Leader</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="christian_name">Christian Name *</Label>
                                            <Input
                                                id="christian_name"
                                                value={profileData.christian_name}
                                                onChange={(e) => setProfileData({...profileData, christian_name: e.target.value})}
                                                className={profileErrors.christian_name ? 'border-red-500' : ''}
                                            />
                                            {profileErrors.christian_name && (
                                                <p className="text-sm text-red-600">{profileErrors.christian_name}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="family_name">Family Name *</Label>
                                            <Input
                                                id="family_name"
                                                value={profileData.family_name}
                                                onChange={(e) => setProfileData({...profileData, family_name: e.target.value})}
                                                className={profileErrors.family_name ? 'border-red-500' : ''}
                                            />
                                            {profileErrors.family_name && (
                                                <p className="text-sm text-red-600">{profileErrors.family_name}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={profileData.email}
                                                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                                className={profileErrors.email ? 'border-red-500' : ''}
                                            />
                                            {profileErrors.email && (
                                                <p className="text-sm text-red-600">{profileErrors.email}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                value={profileData.phone}
                                                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                                                className={profileErrors.phone ? 'border-red-500' : ''}
                                            />
                                            {profileErrors.phone && (
                                                <p className="text-sm text-red-600">{profileErrors.phone}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="id_passport">ID/Passport Number</Label>
                                        <Input
                                            id="id_passport"
                                            value={profileData.id_passport}
                                            onChange={(e) => setProfileData({...profileData, id_passport: e.target.value})}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="bio">Bio</Label>
                                        <Textarea
                                            id="bio"
                                            value={profileData.bio}
                                            onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                                            placeholder="Tell us about yourself..."
                                            rows={3}
                                        />
                                    </div>

                                    <Button type="submit" disabled={profileLoading} className="flex items-center gap-2">
                                        {profileLoading ? (
                                            <LoaderCircle className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4" />
                                        )}
                                        Update Profile
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Password Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Change Password
                                </CardTitle>
                                <CardDescription>Update your password for security</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="current_password">Current Password *</Label>
                                        <Input
                                            id="current_password"
                                            type="password"
                                            value={passwordData.current_password}
                                            onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                                            className={passwordErrors.current_password ? 'border-red-500' : ''}
                                        />
                                        {passwordErrors.current_password && (
                                            <p className="text-sm text-red-600">{passwordErrors.current_password}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="new_password">New Password *</Label>
                                            <Input
                                                id="new_password"
                                                type="password"
                                                value={passwordData.new_password}
                                                onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                                                className={passwordErrors.new_password ? 'border-red-500' : ''}
                                            />
                                            {passwordErrors.new_password && (
                                                <p className="text-sm text-red-600">{passwordErrors.new_password}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="new_password_confirmation">Confirm New Password *</Label>
                                            <Input
                                                id="new_password_confirmation"
                                                type="password"
                                                value={passwordData.new_password_confirmation}
                                                onChange={(e) => setPasswordData({...passwordData, new_password_confirmation: e.target.value})}
                                                className={passwordErrors.new_password_confirmation ? 'border-red-500' : ''}
                                            />
                                            {passwordErrors.new_password_confirmation && (
                                                <p className="text-sm text-red-600">{passwordErrors.new_password_confirmation}</p>
                                            )}
                                        </div>
                                    </div>

                                    <Button type="submit" disabled={passwordLoading} className="flex items-center gap-2">
                                        {passwordLoading ? (
                                            <LoaderCircle className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4" />
                                        )}
                                        Update Password
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Notification Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bell className="h-5 w-5" />
                                    Notification Settings
                                </CardTitle>
                                <CardDescription>Manage your notification preferences</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">Email Notifications</h4>
                                            <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                                        </div>
                                        <Button
                                            variant={notificationSettings.email_notifications ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setNotificationSettings({
                                                ...notificationSettings,
                                                email_notifications: !notificationSettings.email_notifications
                                            })}
                                        >
                                            {notificationSettings.email_notifications ? 'Enabled' : 'Disabled'}
                                        </Button>
                                    </div>

                                    <Separator />

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">SMS Notifications</h4>
                                            <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                                        </div>
                                        <Button
                                            variant={notificationSettings.sms_notifications ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setNotificationSettings({
                                                ...notificationSettings,
                                                sms_notifications: !notificationSettings.sms_notifications
                                            })}
                                        >
                                            {notificationSettings.sms_notifications ? 'Enabled' : 'Disabled'}
                                        </Button>
                                    </div>

                                    <Separator />

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">Activity Alerts</h4>
                                            <p className="text-sm text-muted-foreground">Get notified about unit activities</p>
                                        </div>
                                        <Button
                                            variant={notificationSettings.activity_alerts ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setNotificationSettings({
                                                ...notificationSettings,
                                                activity_alerts: !notificationSettings.activity_alerts
                                            })}
                                        >
                                            {notificationSettings.activity_alerts ? 'Enabled' : 'Disabled'}
                                        </Button>
                                    </div>

                                    <Separator />

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">Report Reminders</h4>
                                            <p className="text-sm text-muted-foreground">Get reminded about pending reports</p>
                                        </div>
                                        <Button
                                            variant={notificationSettings.report_reminders ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setNotificationSettings({
                                                ...notificationSettings,
                                                report_reminders: !notificationSettings.report_reminders
                                            })}
                                        >
                                            {notificationSettings.report_reminders ? 'Enabled' : 'Disabled'}
                                        </Button>
                                    </div>

                                    <Button 
                                        onClick={handleNotificationSettingsUpdate} 
                                        disabled={loading}
                                        className="flex items-center gap-2 mt-4"
                                    >
                                        {loading ? (
                                            <LoaderCircle className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4" />
                                        )}
                                        Save Notification Settings
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Account Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={user?.avatar || undefined} alt={user?.name} />
                                        <AvatarFallback>
                                            {getInitials(user?.name || '')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-medium">{user?.name}</h3>
                                        <p className="text-sm text-muted-foreground">Unit Leader</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Role:</span>
                                        <span className="font-medium">Unit Leader</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Status:</span>
                                        <span className="font-medium text-green-600">Active</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Member Since:</span>
                                        <span className="font-medium">
                                            {(user as any)?.created_at ? new Date((user as any).created_at).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Security Tips */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Security Tips</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Password Security</h4>
                                    <ul className="text-xs text-muted-foreground space-y-1">
                                        <li>• Use at least 8 characters</li>
                                        <li>• Include numbers and symbols</li>
                                        <li>• Don't reuse old passwords</li>
                                        <li>• Change password regularly</li>
                                    </ul>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Account Security</h4>
                                    <ul className="text-xs text-muted-foreground space-y-1">
                                        <li>• Keep your login details private</li>
                                        <li>• Log out when using shared devices</li>
                                        <li>• Report suspicious activity</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </UnitLeaderLayout>
    );
} 