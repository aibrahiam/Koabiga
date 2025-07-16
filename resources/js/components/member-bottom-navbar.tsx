import { Link, usePage } from '@inertiajs/react';
import { 
    Home, 
    MapPin, 
    Sprout, 
    Package, 
    FileText 
} from 'lucide-react';
import { type PageProps } from '@/types';

export default function MemberBottomNavbar() {
    const { url } = usePage<PageProps>();

    const navigation = [
        {
            title: 'Dashboard',
            url: '/koabiga/member/dashboard',
            icon: Home,
        },
        {
            title: 'Land',
            url: '/koabiga/member/land',
            icon: MapPin,
        },
        {
            title: 'Crops',
            url: '/koabiga/member/crops',
            icon: Sprout,
        },
        {
            title: 'Produce',
            url: '/koabiga/member/produce',
            icon: Package,
        },
        {
            title: 'Reports',
            url: '/koabiga/member/reports',
            icon: FileText,
        },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 dark:bg-gray-900 dark:border-gray-700 md:hidden">
            <div className="flex justify-around">
                {navigation.map((item) => {
                    const isActive = url.startsWith(item.url);
                    return (
                        <Link
                            key={item.url}
                            href={item.url}
                            className={`flex flex-col items-center py-2 px-3 text-xs font-medium transition-colors ${
                                isActive
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                        >
                            <item.icon className="h-5 w-5 mb-1" />
                            <span>{item.title}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
} 