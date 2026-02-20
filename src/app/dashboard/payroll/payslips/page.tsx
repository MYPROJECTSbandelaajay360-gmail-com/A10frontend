"use client";
import { useState } from "react";
import { Download, Calendar, ChevronLeft, ChevronRight, Eye } from "lucide-react";

interface Payslip {
	id: string;
	month: string;
	year: number;
	grossSalary: number;
	totalDeductions: number;
	netSalary: number;
	status: "PAID" | "PENDING" | "PROCESSING";
	paidDate?: string;
}

export default function PayslipsPage() {
	const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
	// TODO: Replace with real API call
	const payslips: Payslip[] = [
		{ id: "1", month: "January", year: 2026, grossSalary: 85000, totalDeductions: 12500, netSalary: 72500, status: "PAID", paidDate: "2026-01-31" },
		{ id: "2", month: "December", year: 2025, grossSalary: 85000, totalDeductions: 12500, netSalary: 72500, status: "PAID", paidDate: "2025-12-31" },
		{ id: "3", month: "November", year: 2025, grossSalary: 82000, totalDeductions: 12000, netSalary: 70000, status: "PAID", paidDate: "2025-11-30" },
		{ id: "4", month: "October", year: 2025, grossSalary: 82000, totalDeductions: 12000, netSalary: 70000, status: "PAID", paidDate: "2025-10-31" },
	];

	const getStatusColor = (status: string) => {
		switch (status) {
			case "PAID":
				return "bg-green-100 text-green-700";
			case "PENDING":
				return "bg-yellow-100 text-yellow-700";
			case "PROCESSING":
				return "bg-blue-100 text-blue-700";
			default:
				return "bg-gray-100 text-gray-700";
		}
	};

	const formatCurrency = (amount: number) =>
		new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-gray-900">My Payslips</h1>
				<p className="text-gray-500 mt-1">Download your monthly payslips and view payment status</p>
			</div>
			<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
				<div className="p-4 border-b border-gray-100 flex items-center justify-between">
					<h3 className="text-lg font-semibold text-gray-900">Payslip History</h3>
					<div className="flex items-center gap-2">
						<button onClick={() => setSelectedYear(selectedYear - 1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
							<ChevronLeft className="w-5 h-5" />
						</button>
						<span className="font-semibold text-gray-900 w-16 text-center">{selectedYear}</span>
						<button onClick={() => setSelectedYear(selectedYear + 1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
							<ChevronRight className="w-5 h-5" />
						</button>
					</div>
				</div>
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Month</th>
								<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Gross</th>
								<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Deductions</th>
								<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Net Salary</th>
								<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
								<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							{payslips.filter(p => p.year === selectedYear).map((payslip) => (
								<tr key={payslip.id} className="hover:bg-gray-50">
									<td className="px-6 py-4">
										<div className="flex items-center gap-2">
											<Calendar className="w-4 h-4 text-gray-400" />
											<span className="font-medium text-gray-900">{payslip.month} {payslip.year}</span>
										</div>
									</td>
									<td className="px-6 py-4 text-gray-600">{formatCurrency(payslip.grossSalary)}</td>
									<td className="px-6 py-4 text-red-600">-{formatCurrency(payslip.totalDeductions)}</td>
									<td className="px-6 py-4 font-semibold text-gray-900">{formatCurrency(payslip.netSalary)}</td>
									<td className="px-6 py-4">
										<span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(payslip.status)}`}>
											{payslip.status}
										</span>
									</td>
									<td className="px-6 py-4">
										<div className="flex items-center gap-2">
											<button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="View">
												<Eye className="w-4 h-4 text-gray-500" />
											</button>
											<button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Download">
												<Download className="w-4 h-4 text-gray-500" />
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}