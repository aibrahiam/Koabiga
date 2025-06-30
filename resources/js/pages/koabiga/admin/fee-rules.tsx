import { Head } from '@inertiajs/react';

export default function AdminFeeRules() {
    return (
        <div className="p-6">
            <Head title="Fee Rules Test" />
            <h1 className="text-2xl font-bold">Fee Rules Test Page</h1>
            <p>If you can see this, React is working!</p>
            <p>Current time: {new Date().toLocaleString()}</p>
            </div>
    );
} 