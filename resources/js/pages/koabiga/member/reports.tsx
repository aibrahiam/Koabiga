import MemberSidebarLayout from '@/layouts/member-sidebar-layout';
import MemberBottomNavbar from '@/components/member-bottom-navbar';
import { Head } from '@inertiajs/react';
import { ArrowLeft, FileText, Loader2, Calendar, CheckCircle, XCircle, Clock, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface LandReport {
    id: number;
    land_number: string;
    zone: string;
    unit: string;
    land_area: number;
    crops: CropData[];
    total_produce: number;
    total_fees: number;
    fee_status: string;
}

interface CropData {
    id: number;
    name: string;
    variety: string;
    status: string;
    produce_quantity: number;
    produce_unit: string;
}

export default function MemberReports() {
    const [landReports, setLandReports] = useState<LandReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReportData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Fetch lands with related data
                const landsResponse = await axios.get('/api/member/land');
                const lands = landsResponse.data;
                
                // Fetch crops for all lands
                const cropsResponse = await axios.get('/api/member/crops');
                const crops = cropsResponse.data;
                
                // Fetch produce for all crops
                const produceResponse = await axios.get('/api/member/produce');
                const produce = produceResponse.data;
                
                // Process data into report format
                const reports: LandReport[] = lands.map((land: any) => {
                    // Get crops for this land
                    const landCrops = crops.filter((crop: any) => crop.land_id === land.id);
                    
                    // Calculate total produce for this land
                    let totalProduce = 0;
                    const cropData: CropData[] = landCrops.map((crop: any) => {
                        const cropProduce = produce.filter((p: any) => p.crop_id === crop.id);
                        const produceQty = cropProduce.reduce((sum: number, p: any) => sum + (p.quantity || 0), 0);
                        totalProduce += produceQty;
                        
                        return {
                            id: crop.id,
                            name: crop.name,
                            variety: crop.variety || 'Standard',
                            status: crop.status,
                            produce_quantity: produceQty,
                            produce_unit: cropProduce.length > 0 ? cropProduce[0].unit_of_measure : 'kg'
                        };
                    });
                    
                    // For now, use default values for fees since we can't use await in map
                    let totalFees = 0;
                    let feeStatus = 'No Fees';
                    
                    return {
                        id: land.id,
                        land_number: land.land_number || `Land-${land.id}`,
                        zone: land.zone || 'Zone A',
                        unit: land.unit_id ? `Unit ${land.unit_id}` : 'Unit 1',
                        land_area: land.area || 2.5,
                        crops: cropData,
                        total_produce: totalProduce,
                        total_fees: totalFees,
                        fee_status: feeStatus
                    };
                });
                
                setLandReports(reports);
            } catch (err: any) {
                console.error('Error fetching report data:', err);
                setError(err.response?.data?.message || 'Failed to load report data');
            } finally {
                setLoading(false);
            }
        };

        fetchReportData();
    }, []);

    const getFeeStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'paid':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'overdue':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    const downloadReport = () => {
        // Create PDF
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Member Agricultural Report', 105, 20, { align: 'center' });
        
        // Add date
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
        
        let yPosition = 50;
        
        landReports.forEach((land, landIndex) => {
            // Add land header
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text(`Land ${land.land_number}`, 20, yPosition);
            
            // Add land details
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Zone: ${land.zone} | Unit: ${land.unit} | Area: ${land.land_area} hectares`, 20, yPosition + 8);
            
            yPosition += 20;
            
            if (land.crops.length === 0) {
                // No crops message
                doc.text('No crops planted on this land', 20, yPosition);
                yPosition += 15;
            } else {
                // Prepare table data
                const tableData = land.crops.map(crop => [
                    land.land_number,
                    land.zone,
                    land.unit,
                    `${crop.name} (${crop.variety})`,
                    `${land.land_area} ha`,
                    `${crop.produce_quantity} ${crop.produce_unit}`,
                    `${land.total_fees.toLocaleString()} RWF`,
                    land.fee_status
                ]);
                
                // Add totals row
                tableData.push([
                    'TOTAL',
                    '',
                    '',
                    '',
                    '',
                    `${land.total_produce} kg`,
                    `${land.total_fees.toLocaleString()} RWF`,
                    '-'
                ]);
                
                // Create table
                autoTable(doc, {
                    head: [['Land Number', 'Zone', 'Unit', 'Crop', 'Land Area', 'Produce Qty', 'Fees', 'Fee Status']],
                    body: tableData,
                    startY: yPosition,
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
                
                yPosition = (doc as any).lastAutoTable.finalY + 15;
            }
            
            // Add space between lands
            if (landIndex < landReports.length - 1) {
                yPosition += 10;
            }
        });
        
        // Add summary at the end
        const totalLands = landReports.length;
        const totalCrops = landReports.reduce((sum, land) => sum + land.crops.length, 0);
        const totalProduce = landReports.reduce((sum, land) => sum + land.total_produce, 0);
        const totalFees = landReports.reduce((sum, land) => sum + land.total_fees, 0);
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Summary', 20, yPosition);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Total Lands: ${totalLands}`, 20, yPosition + 10);
        doc.text(`Total Crops: ${totalCrops}`, 20, yPosition + 18);
        doc.text(`Total Produce: ${totalProduce} kg`, 20, yPosition + 26);
        doc.text(`Total Fees: ${totalFees.toLocaleString()} RWF`, 20, yPosition + 34);
        
        // Save PDF
        doc.save(`member_report_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <MemberSidebarLayout breadcrumbs={[{ title: 'Reports', href: '/koabiga/member/reports' }]}> 
            <Head title="My Reports - Koabiga" />
            <div className="flex h-full flex-1 flex-col gap-4 p-2 sm:p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="flex items-center gap-2 rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400"
                            aria-label="Go back"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                        </button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">My Reports</h1>
                            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">View your agricultural reports and data</p>
                            {/* Debug info */}
                            <div className="text-xs text-gray-500 mt-1">
                                Status: {loading ? 'Loading...' : error ? 'Error' : `Loaded ${landReports.length} lands`}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            onClick={downloadReport} 
                            disabled={loading || landReports.length === 0}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            <Download className="h-4 w-4" />
                            Download PDF Report
                        </Button>
                        {landReports.length === 0 && !loading && !error && (
                            <span className="text-sm text-gray-500">(No data available)</span>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="flex items-center space-x-2">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span>Loading report data...</span>
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <p className="text-red-600 mb-4">{error}</p>
                            <button 
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                ) : landReports.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No land data found</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                You haven't been assigned any land yet. Please contact your unit leader for land assignment.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {landReports.map((land) => (
                            <Card key={land.id} className="overflow-hidden">
                                <CardHeader className="bg-gray-50 dark:bg-gray-800">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg">Land {land.land_number}</CardTitle>
                                            <CardDescription>
                                                {land.zone} • {land.unit} • {land.land_area} hectares • {land.crops.length} crops
                                            </CardDescription>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Total Produce</div>
                                            <div className="font-semibold">{land.total_produce} kg</div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-100 dark:bg-gray-700">
                                                <tr>
                                                    <th className="px-4 py-3 text-left font-medium">Land Number</th>
                                                    <th className="px-4 py-3 text-left font-medium">Zone</th>
                                                    <th className="px-4 py-3 text-left font-medium">Unit</th>
                                                    <th className="px-4 py-3 text-left font-medium">Crop</th>
                                                    <th className="px-4 py-3 text-left font-medium">Land Area</th>
                                                    <th className="px-4 py-3 text-left font-medium">Produce Qty</th>
                                                    <th className="px-4 py-3 text-left font-medium">Fees</th>
                                                    <th className="px-4 py-3 text-left font-medium">Fee Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {land.crops.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={8} className="px-4 py-4 text-center text-gray-500">
                                                            No crops planted on this land
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    land.crops.map((crop, index) => (
                                                        <tr key={crop.id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                                                            <td className="px-4 py-3 font-medium">
                                                                {land.land_number}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                {land.zone}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                {land.unit}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div>
                                                                    <div className="font-medium">{crop.name}</div>
                                                                    <div className="text-xs text-gray-500">{crop.variety}</div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                {land.land_area} ha
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                {crop.produce_quantity} {crop.produce_unit}
                                                            </td>
                                                            <td className="px-4 py-3 font-medium">
                                                                {land.total_fees.toLocaleString()} RWF
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <Badge className={getFeeStatusColor(land.fee_status)}>
                                                                    {land.fee_status}
                                                                </Badge>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                                <tr className="bg-green-50 dark:bg-green-900/20 border-t">
                                                    <td colSpan={5} className="px-4 py-3 font-medium">
                                                        Total
                                                    </td>
                                                    <td className="px-4 py-3 font-medium">
                                                        {land.total_produce} kg
                                                    </td>
                                                    <td className="px-4 py-3 font-medium">
                                                        {land.total_fees.toLocaleString()} RWF
                                                    </td>
                                                    <td className="px-4 py-3 font-medium">
                                                        -
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
            <MemberBottomNavbar />
        </MemberSidebarLayout>
    );
} 