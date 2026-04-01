import { useEffect, useState } from "react";
import { useLang } from "../context/LangContext";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

type MonthlyEarning = {
    month: string;
    total: number;
};

type PaymentStatus = {
    id?: string;
    totalAmount: number;
    totalOrders: number;
    paymentStatus: string;
    paidAt?: string;
    notes?: string;
};

interface EarningsChartProps {
    filters?: {
        year?: string;
        month?: string;
        startDate?: string;
        endDate?: string;
    };
}

export default function PartnerEarningsChart({ filters = {} }: EarningsChartProps) {
    const { lang } = useLang();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [monthlyData, setMonthlyData] = useState<MonthlyEarning[]>([]);
    const [totalEarnings, setTotalEarnings] = useState(0);
    const [thisYearEarnings, setThisYearEarnings] = useState(0);
    const [lastMonthEarnings, setLastMonthEarnings] = useState(0);
    const [thisMonthEarnings, setThisMonthEarnings] = useState(0);
    const [pendingAmount, setPendingAmount] = useState(0);

    // Payment confirmation dialog
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState<{ year: number; month: number } | null>(null);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState("");
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);

    // partnerId no longer needed; JWT identifies user

    useEffect(() => {
        async function fetchEarningsData() {
            try {
                setLoading(true);
                setError("");

                let url = `${API_URL}/api/partner/earnings`;
                const qp = new URLSearchParams();
                if (filters.year) qp.append('year', filters.year);
                if (filters.month) qp.append('month', filters.month);
                if (filters.startDate) qp.append('startDate', filters.startDate);
                if (filters.endDate) qp.append('endDate', filters.endDate);
                if ([...qp].length) {
                    url += `?${qp.toString()}`;
                }

                const response = await axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("partnerToken")}`,
                    },
                });

                const data = response.data.data;

                // Aggregate earnings using the pre-calculated monthlyEarnings array from the backend
                const monthlyEarningsList = data.monthlyEarnings || [];
                const monthlyMap: Record<string, number> = {};
                const now = new Date();

                // Initialize last 12 months with 0
                for (let i = 11; i >= 0; i--) {
                    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                    monthlyMap[monthKey] = 0;
                }

                // Apply actual data
                monthlyEarningsList.forEach((monthly: any) => {
                    if (monthlyMap.hasOwnProperty(monthly.month)) {
                        monthlyMap[monthly.month] = parseFloat(monthly.totalEarnings || 0);
                    }
                });

                const chartData = Object.entries(monthlyMap).map(([month, total]) => ({
                    month,
                    total: parseFloat(total.toFixed(2))
                }));

                setMonthlyData(chartData);

                // Calculate Last Month and This Month for the comparison chart
                const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

                const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const lastMonthKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

                setThisMonthEarnings(monthlyMap[currentMonthKey] || 0);
                setLastMonthEarnings(monthlyMap[lastMonthKey] || 0);

            } catch (err) {
                console.error("Failed to fetch earnings data:", err);
                setError("Failed to load earnings data");
            } finally {
                setLoading(false);
            }
        }

        fetchEarningsData();
    }, [filters?.year, filters?.month, filters?.startDate, filters?.endDate]);

    const handleConfirmPayment = (year: number, month: number) => {
        setSelectedMonth({ year, month });
        setConfirmDialogOpen(true);
        fetchPaymentStatus(year, month);
    };

    const fetchPaymentStatus = async (year: number, month: number) => {
        try {
            const response = await axios.get(
                `${API_URL}/api/partner/payment-status/${year}/${month}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("partnerToken")}`,
                    },
                }
            );
            setPaymentStatus(response.data.data?.monthlyEarning ?? null);
        } catch (err) {
            console.error("Failed to fetch payment status:", err);
        }
    };

    const handleConfirmClick = async () => {
        if (!selectedMonth) return;

        setConfirmLoading(true);
        try {
            await axios.post(
                `${API_URL}/api/partner/confirm-payment`,
                {
                    year: selectedMonth.year,
                    month: selectedMonth.month,
                    notes: confirmMessage
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("partnerToken")}`,
                    },
                }
            );

            setConfirmDialogOpen(false);
            setConfirmMessage("");
            setSelectedMonth(null);
            window.location.reload();
        } catch (err) {
            console.error("Failed to confirm payment:", err);
            alert("Failed to confirm payment");
        } finally {
            setConfirmLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8 text-gray-400">Loading graphs...</div>;
    }

    if (error) {
        return (
            <Alert className="border-red-200 bg-red-50 mt-4 rounded-xl">
                <AlertTitle className="text-red-800">Error rendering graphs</AlertTitle>
                <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Monthly Earnings Trend Graph */}
                <Card className="p-6 lg:col-span-2 border border-gray-100 shadow-sm rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Earnings Trend (12 Months)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={monthlyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis
                                dataKey="month"
                                tickFormatter={(val) => {
                                    const parts = val.split('-');
                                    return parts.length === 2 ? `${parts[1]}/${parts[0].substring(2)}` : val;
                                }}
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                            />
                            <YAxis
                                tickFormatter={(val) => `₹${val}`}
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                                dx={-10}
                            />
                            <Tooltip
                                formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Amount']}
                                labelFormatter={(label) => `Month: ${label}`}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="total"
                                stroke="#111827"
                                strokeWidth={3}
                                dot={{ fill: "#111827", strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }}
                                animationDuration={1000}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>

                <div className="space-y-6">
                    {/* Comparison Chart */}
                    <Card className="p-6 border border-gray-100 shadow-sm rounded-xl bg-white">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Comparison</h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={[
                                { name: "Last Month", value: lastMonthEarnings },
                                { name: "This Month", value: thisMonthEarnings }
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                                <Tooltip
                                    formatter={(value) => [`₹${value}`, 'Amount']}
                                    cursor={{ fill: '#F3F4F6' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="value" fill="#0EA5E9" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>

                    {/* Minimal Apple-like Payment Confirmation Card */}
                    <Card className="p-6 border border-gray-100 shadow-sm shadow-blue-500/5 rounded-xl bg-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500 ease-out" />
                        <div className="relative">
                            <h4 className="text-lg font-semibold text-gray-900 mb-1">Confirm Payment</h4>
                            <p className="text-sm text-gray-500 mb-4 leading-relaxed tracking-wide">
                                Request a confirmation of your earnings with the administration for this period.
                            </p>
                            <Button
                                onClick={() => {
                                    const now = new Date();
                                    handleConfirmPayment(now.getFullYear(), now.getMonth() + 1);
                                }}
                                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 rounded-lg shadow-sm transition-all shadow-gray-900/10"
                            >
                                Verify Status
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Confirmation Dialog */}
            <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                <DialogContent className="max-w-md bg-white">
                    <DialogHeader>
                        <DialogTitle>Confirm Payment</DialogTitle>
                        <DialogDescription>
                            Confirm payment for {selectedMonth ? `${selectedMonth.month}/${selectedMonth.year}` : "this month"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div className="p-3 bg-gray-50 rounded">
                            <p className="text-sm text-gray-600">Total Amount</p>
                            <p className="text-lg font-bold">
                                ₹{paymentStatus ? Number(paymentStatus.totalAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00"}
                            </p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded">
                            <p className="text-sm text-gray-600">Total Orders</p>
                            <p className="text-lg font-bold">{paymentStatus?.totalOrders ?? 0}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded">
                            <p className="text-sm text-gray-600">Status</p>
                            <p className="text-lg font-bold capitalize">{paymentStatus?.paymentStatus ?? "PENDING"}</p>
                        </div>
                    </div>
                    <textarea
                        className="w-full h-24 p-2 border border-gray-300 rounded resize-none"
                        placeholder="Add notes (optional)"
                        value={confirmMessage}
                        onChange={(e) => setConfirmMessage(e.target.value)}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmClick}
                            disabled={confirmLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {confirmLoading ? "Confirming..." : "Confirm"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
