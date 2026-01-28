import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Modul PO & Inventory",
  description: "Purchase Order and Inventory Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex">
          <Sidebar />
          <main className="flex-1 ml-64 p-8 bg-gray-50 min-h-screen text-gray-800 print:ml-0 print:p-0 print:bg-white">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
