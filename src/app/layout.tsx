import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "HRMS Portal | Human Resource Management System",
  description: "Comprehensive HRMS Portal for attendance tracking, leave management, payroll processing and employee management.",
  keywords: "HRMS, HR, Human Resources, Attendance, Leave, Payroll, Employee Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
