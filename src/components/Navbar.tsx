"use client";
import { Search, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

function formatTitle(pathname: string) {
  // take last part of the path
  const slug = pathname.split("/").filter(Boolean).pop() ?? "dashboard";

  // replace dashes with spaces + capitalize each word
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function Navbar() {
  const pathname = usePathname(); // e.g. "/pending-orders"
  const title = formatTitle(pathname); // => "Pending Orders"

  return (
    <header className="flex justify-between items-center bg-white border-b px-6 py-3">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-gray-500">Home &gt; {title}</p>
      </div>
      <div className="flex items-center gap-4">
        <Search size={18} className="text-gray-600 cursor-pointer" />
        <Calendar size={18} className="text-gray-600 cursor-pointer" />
        <Button variant="outline">Admin</Button>
      </div>
    </header>
  );
}
