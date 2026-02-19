import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "Musterbook | Human Resource Management System",
  description: "Comprehensive Musterbook Portal for attendance tracking, leave management, payroll processing and employee management.",
  keywords: "Musterbook, HR, Human Resources, Attendance, Leave, Payroll, Employee Management",
  metadataBase: new URL('https://musterbook.com'),
  openGraph: {
    title: "Musterbook | Human Resource Management System",
    description: "Steamline your HR operations with Musterbook.",
    url: 'https://musterbook.com',
    siteName: 'Musterbook',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Musterbook | HRMS",
    description: "Efficient HR management for modern teams.",
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
