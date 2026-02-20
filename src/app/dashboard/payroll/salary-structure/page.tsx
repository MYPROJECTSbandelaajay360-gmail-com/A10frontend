"use client";
import { Wallet, TrendingUp, DollarSign } from "lucide-react";

export default function SalaryStructurePage() {
	// TODO: Replace with real API call
	const currentSalary = {
		basic: 45000,
		hra: 18000,
		specialAllowance: 15000,
		conveyance: 4000,
		medical: 3000,
		pf: 5400,
		professionalTax: 200,
		incomeTax: 6900,
	};
	const totalEarnings = currentSalary.basic + currentSalary.hra + currentSalary.specialAllowance + currentSalary.conveyance + currentSalary.medical;
	const totalDeductions = currentSalary.pf + currentSalary.professionalTax + currentSalary.incomeTax;
	const netSalary = totalEarnings - totalDeductions;
	const formatCurrency = (amount: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-gray-900">Salary Structure</h1>
				<p className="text-gray-500 mt-1">Detailed breakdown of your current salary package</p>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-green-100 text-sm font-medium">Net Salary</p>
							<p className="text-3xl font-bold mt-1">{formatCurrency(netSalary)}</p>
							<p className="text-green-100 text-xs mt-2">Monthly Take Home</p>
						</div>
						<div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
							<Wallet className="w-7 h-7" />
						</div>
					</div>
				</div>
				<div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-gray-500 text-sm font-medium">Gross Salary</p>
							<p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(totalEarnings)}</p>
							<p className="text-gray-400 text-xs mt-2">Before Deductions</p>
						</div>
						<div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center">
							<TrendingUp className="w-7 h-7 text-blue-600" />
						</div>
					</div>
				</div>
				<div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-gray-500 text-sm font-medium">Total Deductions</p>
							<p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(totalDeductions)}</p>
							<p className="text-gray-400 text-xs mt-2">Tax + PF + PT</p>
						</div>
						<div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center">
							<DollarSign className="w-7 h-7 text-red-600" />
						</div>
					</div>
				</div>
			</div>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Earnings */}
				<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings</h3>
					<div className="space-y-4">
						{[
							{ label: "Basic Salary", value: currentSalary.basic },
							{ label: "HRA", value: currentSalary.hra },
							{ label: "Special Allowance", value: currentSalary.specialAllowance },
							{ label: "Conveyance Allowance", value: currentSalary.conveyance },
							{ label: "Medical Allowance", value: currentSalary.medical },
						].map((item, index) => (
							<div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
								<span className="text-gray-600">{item.label}</span>
								<span className="font-semibold text-gray-900">{formatCurrency(item.value)}</span>
							</div>
						))}
						<div className="flex items-center justify-between py-3 bg-green-50 rounded-lg px-3 mt-2">
							<span className="font-semibold text-green-700">Total Earnings</span>
							<span className="font-bold text-green-700">{formatCurrency(totalEarnings)}</span>
						</div>
					</div>
				</div>
				{/* Deductions */}
				<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Deductions</h3>
					<div className="space-y-4">
						{[
							{ label: "Provident Fund (PF)", value: currentSalary.pf },
							{ label: "Professional Tax", value: currentSalary.professionalTax },
							{ label: "Income Tax (TDS)", value: currentSalary.incomeTax },
						].map((item, index) => (
							<div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
								<span className="text-gray-600">{item.label}</span>
								<span className="font-semibold text-red-600">-{formatCurrency(item.value)}</span>
							</div>
						))}
						<div className="flex items-center justify-between py-3 bg-red-50 rounded-lg px-3 mt-2">
							<span className="font-semibold text-red-700">Total Deductions</span>
							<span className="font-bold text-red-700">-{formatCurrency(totalDeductions)}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}