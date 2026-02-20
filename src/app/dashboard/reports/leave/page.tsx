"use client";
import { useState } from "react";
import { Calendar, User, FileText } from "lucide-react";

interface LeaveReportRow {
  id: string;
  employee: string;
  leaveType: string;
  from: string;
  to: string;
  days: number;
  status: "APPROVED" | "PENDING" | "REJECTED";
}

export default function LeaveReportsPage() {
  // TODO: Replace with real API call
  const [rows] = useState<LeaveReportRow[]>([
    { id: "1", employee: "Ajay Kumar", leaveType: "Sick Leave", from: "2026-02-10", to: "2026-02-12", days: 3, status: "APPROVED" },
    { id: "2", employee: "Syed Pasha", leaveType: "Casual Leave", from: "2026-01-15", to: "2026-01-16", days: 2, status: "PENDING" },
    { id: "3", employee: "Bandela Ajay", leaveType: "Earned Leave", from: "2026-01-05", to: "2026-01-10", days: 6, status: "REJECTED" },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Leave Reports</h1>
        <p className="text-gray-500 mt-1">View all employee leave records across the organization</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Leave Type</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">From</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">To</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Days</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 flex items-center gap-2"><User className="w-4 h-4 text-gray-400" />{row.employee}</td>
                <td className="px-6 py-4">{row.leaveType}</td>
                <td className="px-6 py-4"><Calendar className="w-4 h-4 inline mr-1 text-gray-400" />{row.from}</td>
                <td className="px-6 py-4"><Calendar className="w-4 h-4 inline mr-1 text-gray-400" />{row.to}</td>
                <td className="px-6 py-4">{row.days}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(row.status)}`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Download Report">
                    <FileText className="w-4 h-4 text-gray-500" />
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
