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
                setTotalEarnings(data.totalEarnings || 0);

                // Calculate monthly breakdown
                const earnings = data.earnings || [];
                const monthlyMap: Record<string, number> = {};
                const now = new Date();

                // Initialize last 12 months
                for (let i = 11; i >= 0; i--) {
                    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                    monthlyMap[monthKey] = 0;
                }

                // Aggregate earnings by month
                earnings.forEach((earning: any) => {
                    const d = new Date(earning.createdAt);
                    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                    if (monthlyMap.hasOwnProperty(monthKey)) {
                        monthlyMap[monthKey] += parseFloat(earning.amount || 0);
                    }
                });

                const chartData = Object.entries(monthlyMap).map(([month, total]) => ({
                    month,
                    total: parseFloat(total.toFixed(2))
                }));

                setMonthlyData(chartData);

                // Calculate year and month breakdowns
                const currentYear = now.getFullYear();
                const currentMonth = now.getMonth() + 1;

                let yearTotal = 0;
                let thisMonthTotal = 0;
                let lastMonthTotal = 0;

                earnings.forEach((earning: any) => {
                    const d = new Date(earning.createdAt);
                    const amount = parseFloat(earning.amount || 0);

                    if (d.getFullYear() === currentYear) {
                        yearTotal += amount;
                    }

                    if (d.getFullYear() === currentYear && d.getMonth() + 1 === currentMonth) {
                        thisMonthTotal += amount;
                    }

                    if (d.getFullYear() === currentYear && d.getMonth() === currentMonth - 2) {
                        lastMonthTotal += amount;
                    }
                });

                setThisYearEarnings(parseFloat(yearTotal.toFixed(2)));
                setThisMonthEarnings(parseFloat(thisMonthTotal.toFixed(2)));
                setLastMonthEarnings(parseFloat(lastMonthTotal.toFixed(2)));
                setPendingAmount(data.pendingAmount || 0);
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

        // Fetch current payment status
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

            // Refresh data
            window.location.reload();
        } catch (err) {
            console.error("Failed to confirm payment:", err);
            alert("Failed to confirm payment");
        } finally {
            setConfirmLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading earnings data...</div>;
    }

    if (error) {
        return (
            <Alert className="border-red-200 bg-red-50">
                <AlertTitle className="text-red-800">Error</AlertTitle>
                <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="text-sm text-gray-600">Total Earnings</div>
                    <div className="text-2xl font-bold text-blue-900 mt-2">
                        ₹{totalEarnings.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </div>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
                    <div className="text-sm text-gray-600">This Year</div>
                    <div className="text-2xl font-bold text-green-900 mt-2">
                        ₹{thisYearEarnings.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </div>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100">
                    <div className="text-sm text-gray-600">This Month</div>
                    <div className="text-2xl font-bold text-purple-900 mt-2">
                        ₹{thisMonthEarnings.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </div>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100">
                    <div className="text-sm text-gray-600">Last Month</div>
                    <div className="text-2xl font-bold text-orange-900 mt-2">
                        ₹{lastMonthEarnings.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </div>
                </Card>
            </div>

            {/* Monthly Earnings Chart */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Monthly Earnings</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => `₹${value}`} />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="total"
                            stroke="#8b5cf6"
                            strokeWidth={2}
                            name="Earnings"
                            dot={{ fill: "#8b5cf6" }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Card>

            {/* Comparison Chart */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Month Comparison</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                        { name: "Last Month", value: lastMonthEarnings },
                        { name: "This Month", value: thisMonthEarnings }
                    ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `₹${value}`} />
                        <Bar dataKey="value" fill="#8b5cf6" />
                    </BarChart>
                </ResponsiveContainer>
            </Card>

            {/* Payment Confirmation Button */}
            <Card className="p-6 bg-gradient-to-r from-[#fef3c7] to-[#fcd34d]">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900">Confirm Payment Status</h4>
                        <p className="text-sm text-gray-700 mt-1">Verify and confirm your monthly earnings payment</p>
                    </div>
                    <Button
                        onClick={() => {
                            const now = new Date();
                            handleConfirmPayment(now.getFullYear(), now.getMonth() + 1);
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Confirm This Month
                    </Button>
                </div>
            </Card>

            {/* Confirmation Dialog */}
            <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                <DialogContent className="max-w-md">
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
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {confirmLoading ? "Confirming..." : "Confirm"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
