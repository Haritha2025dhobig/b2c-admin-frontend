"use client";
import { Search, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <header className="flex justify-between items-center bg-white border-b px-6 py-3">
      <div>
        <h2 className="text-lg font-semibold">Dashboard</h2>
        <p className="text-sm text-gray-500">Home &gt; Dashboard</p>
      </div>
      <div className="flex items-center gap-4">
        <Search size={18} className="text-gray-600 cursor-pointer" />
        <Calendar size={18} className="text-gray-600 cursor-pointer" />
        <Button variant="outline">Admin </Button>
      </div>
    </header>
  );
}
