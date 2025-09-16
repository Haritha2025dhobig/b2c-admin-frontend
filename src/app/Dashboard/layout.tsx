// app/(dashboard)/layout.tsx
"use client";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Navbar */}
        <Navbar />

        {/* Page content area (no scroll here) */}
        <main className="flex-1 min-h-0 min-w-0 bg-gray-50 p-4 overflow-hidden">
          {/* ⬇️ Only this box (the red section) scrolls in both X & Y */}
          <div className="h-full w-full overflow-auto rounded-md border border-gray-200 bg-white [scrollbar-gutter:stable]">
            {/* keep wide tables from wrapping so horizontal scroll appears */}
            <div className="">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
