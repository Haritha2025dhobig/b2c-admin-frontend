// "use client";

// import Sidebar from "@/components/Sidebar";
// import Navbar from "@/components/Navbar";
// import StatsCard from "@/components/StatsCard";
// import SalesGraph from "@/components/SalesGraph";
// import BestSellers from "@/components/BestSellers";
// import RecentOrdersTable from "@/components/RecentOrdersTable";
// import { Package, CheckCircle, XCircle, ShoppingCart } from "lucide-react";
// import {useRouter} from "next/navigation";
// import { useEffect, useState } from "react";



// export default function DashboardPage() {
//   const router = useRouter();

//   useEffect(() => {
//     const token = localStorage.getItem("access_token");
//     if (!token) {
//       router.push("/Login");
//     }
//   }, [router]);
  
//   return (
//     <div className="flex">
//       <Sidebar />
//       <div className="flex-2 bg-gray-50">
//         <Navbar />

//         {/* Stats Section */}
//         <div className="grid grid-cols-4 gap-4 p-4">
//           <StatsCard title="Total Orders" value="₹126,500" icon={<ShoppingCart className="text-blue-500" />} />
//           <StatsCard title="Active Orders" value="₹126,500" icon={<Package className="text-yellow-500" />} />
//           <StatsCard title="Completed Orders" value="₹126,500" icon={<CheckCircle className="text-green-500" />} />
//           <StatsCard title="Return Orders" value="₹126,500" icon={<XCircle className="text-red-500" />} />
//         </div>

//         {/* Graph + Best Sellers */}
        
          
        

       
//       </div>
//     </div>
//   );
// }



"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "@/utils/api";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import StatsCard from "@/components/StatsCard";
import RecentOrdersTable from "@/components/RecentOrdersTable";
import SalesGraph from "@/components/SalesGraph";
import { Package, CheckCircle, ShoppingCart } from "lucide-react";
import {useRouter} from "next/navigation"

interface DashboardStats {
  total_orders: number;
  active_orders: number;
  completed_orders: number;
  processing_orders: number;
}

interface Order {
  id: string;
  date: string;
  customer: string;
  status: string;
  amount: string;
  full_address?: string;
}

interface SalesData {
  day: string;
  total: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    total_orders: 0,
    active_orders: 0,
    completed_orders: 0,
    processing_orders: 0,
  });

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [salesFilter, setSalesFilter] = useState<"weekly" | "monthly" | "yearly">("monthly");



  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${BASE_URL}dashboard/stats/`);
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    const fetchRecentOrders = async () => {
      try {
        const response = await axios.get(`${BASE_URL}dashboard/recent-orders/`);
        

        const mappedOrders: Order[] = response.data.map((o: any) => ({
          id: o.id || "N/A",
          date: o.order_created_at
            ? new Date(o.order_created_at).toLocaleDateString()
            : "N/A",
          customer: o.name || "N/A",
          order_status: o.order_status
            ? typeof o.order_status === "string"
              ? { status: o.order_status }
              : o.order_status 
            : { status: "Pending" }, 
            total_amount: o.total_amount != null ? Number(o.total_amount) : 0,
        }));
        setRecentOrders(mappedOrders);
      } catch (error) {
        console.error("Error fetching recent orders:", error);
      }
    };

    fetchStats();
    fetchRecentOrders();
  }, []);

  // Fetch sales data whenever the filter changes
  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}dashboard/sales-graph/`, {
          params: { filter: salesFilter }, // API should accept ?filter=weekly/monthly/yearly
        });

        const formattedData = response.data.map((item: any) => ({
          day: new Date(item.day).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          total: item.total,
        }));

        setSalesData(formattedData);
      } catch (error) {
        console.error("Error fetching sales graph data:", error);
      }
    };

    fetchSalesData();
  }, [salesFilter]);

  return (
    <div className="flex">
      {/* <Sidebar /> */}
      <div className="flex-2 bg-gray-50">
        {/* <Navbar /> */}

        {/* Stats Section */}
        <div className="grid grid-cols-4 gap-4 p-4">
          <StatsCard
            title="Total Orders"
            value={stats.total_orders}
            icon={<ShoppingCart className="text-blue-500" />}
          />
          <StatsCard
            title="Active Orders"
            value={stats.active_orders}
            icon={<Package className="text-yellow-500" />}
          />
          <StatsCard
            title="Processing Orders"
            value={stats.processing_orders}
            icon={<CheckCircle className="text-green-500" />}
          />
          <StatsCard
            title="Completed Orders"
            value={stats.completed_orders}
            icon={<CheckCircle className="text-green-500" />}
          />
        </div>

        {/* Graph Section */}
        <div className="grid grid-cols-3 gap-4 p-4">
          <div className="col-span-2">
            <SalesGraph
              data={salesData}
              filter={salesFilter}
              onFilterChange={(value) => setSalesFilter(value)}
            />
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="p-2">
          <RecentOrdersTable orders={recentOrders} />
        </div>
      </div>
    </div>
  );
}