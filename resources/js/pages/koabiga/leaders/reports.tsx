import { Head } from '@inertiajs/react';
import { FileText, Download, BarChart3 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useState, useEffect } from 'react';
import axios from 'axios';
import UnitLeaderLayout from '@/layouts/unit-leader-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
            { title: 'Unit Leader Dashboard', href: '/koabiga/leaders/dashboard' },
        { title: 'Reports', href: '/koabiga/leaders/reports' },
];

interface UnitReport {
    id: number;
    title: string;
    type: string;
    status: string;
    lastModified: string;
    members: number;
    totalLands: number;
}

export default function UnitLeaderReports() {
    const [unitReports, setUnitReports] = useState<UnitReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await axios.get('/api/leaders/reports');
            
            if (response.data.success) {
                setUnitReports(response.data.data || []);
            } else {
                setError(response.data.message || 'Failed to fetch reports');
            }
        } catch (err: any) {
            console.error('Error fetching reports:', err);
            setError(err.response?.data?.message || 'Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const downloadReport = () => {
        // Create PDF
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Unit Leader Reports Summary', 105, 20, { align: 'center' });
        
        // Add date
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
        
        // Prepare table data
        const tableData = unitReports.map(report => [
            report.title,
            report.type,
            report.status,
            report.lastModified,
            report.members.toString(),
            report.totalLands.toString()
        ]);
        
        // Create table
        autoTable(doc, {
            head: [['Report Title', 'Type', 'Status', 'Last Modified', 'Members', 'Total Lands']],
            body: tableData,
            startY: 50,
            margin: { left: 20, right: 20 },
            styles: {
                fontSize: 8,
                cellPadding: 2,
            },
            headStyles: {
                fillColor: [34, 197, 94], // Green color
                textColor: 255,
                fontStyle: 'bold',
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252], // Light gray
            },
            didDrawPage: function (data) {
                // Add page number
                doc.setFontSize(8);
                doc.text(`Page ${doc.getCurrentPageInfo().pageNumber}`, 105, doc.internal.pageSize.height - 10, { align: 'center' });
            }
        });
        
        // Add summary
        const yPosition = (doc as any).lastAutoTable.finalY + 20;
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Summary', 20, yPosition);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Total Reports: ${unitReports.length}`, 20, yPosition + 10);
        doc.text(`Draft Reports: ${unitReports.filter(r => r.status === 'draft').length}`, 20, yPosition + 18);
        doc.text(`Submitted Reports: ${unitReports.filter(r => r.status === 'submitted').length}`, 20, yPosition + 26);
        doc.text(`Total Members: ${unitReports[0]?.members || 0}`, 20, yPosition + 34);
        doc.text(`Total Lands: ${unitReports[0]?.totalLands || 0}`, 20, yPosition + 42);
        
        // Save PDF
        doc.save(`unit_leader_reports_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <UnitLeaderLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports - Koabiga" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
                        <p className="text-gray-600 dark:text-gray-400">Submit and manage unit reports</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={downloadReport} className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100">
                            <Download className="h-4 w-4 mr-2" />
                            Export Reports
                        </Button>
                        <Button>
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Generate Report
                        </Button>
                    </div>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                            Report Management
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {unitReports.map((report) => (
                                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <h3 className="font-medium">{report.title}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {report.type} • Last modified: {report.lastModified}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            report.status === 'submitted' 
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                        }`}>
                                            {report.status}
                                        </span>
                                        <Button variant="outline" size="sm">
                                            <FileText className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </UnitLeaderLayout>
    );
} 