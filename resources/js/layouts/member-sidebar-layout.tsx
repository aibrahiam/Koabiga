import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { MemberSidebar } from '@/components/member-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import MemberBottomNavbar from '@/components/member-bottom-navbar';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

export default function MemberSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    return (
        <>
            <AppShell variant="sidebar">
                <MemberSidebar />
                <AppContent variant="sidebar" className="overflow-x-hidden pb-16 md:pb-0">
                    <AppSidebarHeader breadcrumbs={breadcrumbs} />
                    {children}
                </AppContent>
            </AppShell>
            <MemberBottomNavbar />
        </>
    );
} 