import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { UnitLeaderSidebar } from '@/components/unit-leader-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import UnitLeaderBottomNavbar from '@/components/unit-leader-bottom-navbar';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

export default function UnitLeaderLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    return (
        <>
            <AppShell variant="sidebar">
                <UnitLeaderSidebar />
                <AppContent variant="sidebar" className="overflow-x-hidden pb-16 md:pb-0">
                    <AppSidebarHeader breadcrumbs={breadcrumbs} />
                    {children}
                </AppContent>
            </AppShell>
            <UnitLeaderBottomNavbar />
        </>
    );
} 