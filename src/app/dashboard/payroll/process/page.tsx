"use client";
import { useState } from "react";
import { Download, CheckCircle, Loader2 } from "lucide-react";

interface PayrollProcessRow {
	id: string;
	employee: string;
	month: string;
	year: number;
	status: "PENDING" | "PROCESSING" | "PAID";
}

export default function ProcessPayrollPage() {
	// TODO: Replace with real API call
	const [processing, setProcessing] = useState(false);
	const [rows, setRows] = useState<PayrollProcessRow[]>([
		{ id: "1", employee: "Ajay Kumar", month: "January", year: 2026, status: "PAID" },
		{ id: "2", employee: "Syed Pasha", month: "January", year: 2026, status: "PROCESSING" },
		{ id: "3", employee: "Bandela Ajay", month: "January", year: 2026, status: "PENDING" },
	]);

	const handleProcess = () => {
		setProcessing(true);
		setTimeout(() => {
			setRows(rows.map(r => r.status === "PENDING" ? { ...r, status: "PROCESSING" } : r));
			setProcessing(false);
		}, 2000);
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-gray-900">Process Payroll</h1>
				<p className="text-gray-500 mt-1">Run payroll for employees, mark as paid, and download payroll summary</p>
			</div>
			<div className="flex justify-end">
				<button
					onClick={handleProcess}
					disabled={processing}
					className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50"
				>
					{processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
					{processing ? "Processing..." : "Run Payroll"}
				</button>
			</div>
			<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
				<table className="w-full">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Employee</th>
							<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Month</th>
							<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Year</th>
							<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
							<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100">
						{rows.map(row => (
							<tr key={row.id} className="hover:bg-gray-50">
								<td className="px-6 py-4 font-medium text-gray-900">{row.employee}</td>
								<td className="px-6 py-4">{row.month}</td>
								<td className="px-6 py-4">{row.year}</td>
								<td className="px-6 py-4">
									<span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${row.status === "PAID" ? "bg-green-100 text-green-700" : row.status === "PROCESSING" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}>
										{row.status}
									</span>
								</td>
								<td className="px-6 py-4">
									<button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Download Payroll">
										<Download className="w-4 h-4 text-gray-500" />
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}