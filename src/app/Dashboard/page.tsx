import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import StatsCard from "@/components/StatsCard";
import SalesGraph from "@/components/SalesGraph";
import BestSellers from "@/components/BestSellers";
import RecentOrdersTable from "@/components/RecentOrdersTable";
import { Package, CheckCircle, XCircle, ShoppingCart } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-2 bg-gray-50">
        <Navbar />

        {/* Stats Section */}
        <div className="grid grid-cols-4 gap-4 p-4">
          <StatsCard title="Total Orders" value="₹126,500" icon={<ShoppingCart className="text-blue-500" />} />
          <StatsCard title="Active Orders" value="₹126,500" icon={<Package className="text-yellow-500" />} />
          <StatsCard title="Completed Orders" value="₹126,500" icon={<CheckCircle className="text-green-500" />} />
          <StatsCard title="Return Orders" value="₹126,500" icon={<XCircle className="text-red-500" />} />
        </div>

        {/* Graph + Best Sellers */}
        
          
        

       
      </div>
    </div>
  );
}
