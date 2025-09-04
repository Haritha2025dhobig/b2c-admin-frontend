// // "use client";

// // import Sidebar from "@/components/Sidebar";
// // import Navbar from "@/components/Navbar";
// // import StatsCard from "@/components/StatsCard";
// // import SalesGraph from "@/components/SalesGraph";
// // import BestSellers from "@/components/BestSellers";
// // import RecentOrdersTable from "@/components/RecentOrdersTable";
// // import { Package, CheckCircle, XCircle, ShoppingCart } from "lucide-react";
// // import {useRouter} from "next/navigation";
// // import { useEffect, useState } from "react";



// // export default function DashboardPage() {
// //   const router = useRouter();

// //   useEffect(() => {
// //     const token = localStorage.getItem("access_token");
// //     if (!token) {
// //       router.push("/Login");
// //     }
// //   }, [router]);
  
// //   return (
// //     <div className="flex">
// //       <Sidebar />
// //       <div className="flex-2 bg-gray-50">
// //         <Navbar />

// //         {/* Stats Section */}
// //         <div className="grid grid-cols-4 gap-4 p-4">
// //           <StatsCard title="Total Orders" value="₹126,500" icon={<ShoppingCart className="text-blue-500" />} />
// //           <StatsCard title="Active Orders" value="₹126,500" icon={<Package className="text-yellow-500" />} />
// //           <StatsCard title="Completed Orders" value="₹126,500" icon={<CheckCircle className="text-green-500" />} />
// //           <StatsCard title="Return Orders" value="₹126,500" icon={<XCircle className="text-red-500" />} />
// //         </div>

// //         {/* Graph + Best Sellers */}
        
          
        

       
// //       </div>
// //     </div>
// //   );
// // }



// "use client";

// import { useEffect, useState } from "react";
// import axios from "axios";
// import { BASE_URL } from "@/utils/api";
// // import Sidebar from "@/components/Sidebar";
// // import Navbar from "@/components/Navbar";
// import StatsCard from "@/components/StatsCard";
// import RecentOrdersTable from "@/components/RecentOrdersTable";
// import SalesGraph from "@/components/SalesGraph";
// import { Package, CheckCircle, ShoppingCart } from "lucide-react";
// // import { useRouter } from "next/navigation";

// interface DashboardStats {
//   total_orders: number;
//   active_orders: number;
//   completed_orders: number;
//   processing_orders: number;
// }

// interface OrderApiResponse {
//   id?: string | number;
//   order_created_at?: string;
//   name?: string;
//   order_status?: string | { id: number; status: string };
//   total_amount?: string | number | null;
// }

// interface Order {
//   id: string;
//   date: string;
//   customer: string;
//   order_status: { status: string } | { id: number; status: string };
//   total_amount: number;
// }

// interface SalesApiResponse {
//   day: string;
//   total: number;
// }

// interface SalesData {
//   day: string;
//   total: number;
// }

// export default function DashboardPage() {
//   const [stats, setStats] = useState<DashboardStats>({
//     total_orders: 0,
//     active_orders: 0,
//     completed_orders: 0,
//     processing_orders: 0,
//   });

//   const [recentOrders, setRecentOrders] = useState<Order[]>([]);
//   const [salesData, setSalesData] = useState<SalesData[]>([]);
//   const [salesFilter, setSalesFilter] = useState<"weekly" | "monthly" | "yearly">("monthly");

//   // Fetch stats
//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         const response = await axios.get<DashboardStats>(`${BASE_URL}dashboard/stats/`);
//         setStats(response.data);
//       } catch (error) {
//         console.error("Error fetching stats:", error);
//       }
//     };

//     const fetchRecentOrders = async () => {
//       try {
//         const response = await axios.get<OrderApiResponse[]>(`${BASE_URL}dashboard/recent-orders/`);

//         const mappedOrders: Order[] = response.data.map((o) => ({
//           id: String(o.id ?? "N/A"),
//           date: o.order_created_at
//             ? new Date(o.order_created_at).toLocaleDateString()
//             : "N/A",
//           customer: o.name ?? "N/A",
//           order_status: o.order_status
//             ? typeof o.order_status === "string"
//               ? { status: o.order_status }
//               : o.order_status
//             : { status: "Pending" },
//           total_amount: o.total_amount != null ? Number(o.total_amount) : 0,
//         }));
//         setRecentOrders(mappedOrders);
//       } catch (error) {
//         console.error("Error fetching recent orders:", error);
//       }
//     };

//     fetchStats();
//     fetchRecentOrders();
//   }, []);

//   // Fetch sales data whenever the filter changes
//   useEffect(() => {
//     const fetchSalesData = async () => {
//       try {
//         const response = await axios.get<SalesApiResponse[]>(`${BASE_URL}dashboard/sales-graph/`, {
//           params: { filter: salesFilter },
//         });

//         const formattedData: SalesData[] = response.data.map((item) => ({
//           day: new Date(item.day).toLocaleDateString("en-US", {
//             month: "short",
//             day: "numeric",
//           }),
//           total: item.total,
//         }));

//         setSalesData(formattedData);
//       } catch (error) {
//         console.error("Error fetching sales graph data:", error);
//       }
//     };

//     fetchSalesData();
//   }, [salesFilter]);

//   return (
//     <div className="flex">
//       {/* <Sidebar /> */}
//       <div className="flex-2 bg-gray-50">
//         {/* <Navbar /> */}

//         {/* Stats Section */}
//         <div className="grid grid-cols-4 gap-4 p-4">
//           <StatsCard
//             title="Total Orders"
//             value={stats.total_orders}
//             icon={<ShoppingCart className="text-blue-500" />}
//           />
//           <StatsCard
//             title="Active Orders"
//             value={stats.active_orders}
//             icon={<Package className="text-yellow-500" />}
//           />
//           <StatsCard
//             title="Processing Orders"
//             value={stats.processing_orders}
//             icon={<CheckCircle className="text-green-500" />}
//           />
//           <StatsCard
//             title="Completed Orders"
//             value={stats.completed_orders}
//             icon={<CheckCircle className="text-green-500" />}
//           />
//         </div>

//         {/* Graph Section */}
//         <div className="grid grid-cols-3 gap-4 p-4">
//           <div className="col-span-2">
//             <SalesGraph
//               data={salesData}
//               filter={salesFilter}
//               onFilterChange={(value) => setSalesFilter(value)}
//             />
//           </div>
//         </div>

//         {/* Recent Orders Table */}
//         <div className="p-2">
//           <RecentOrdersTable orders={recentOrders} />
//         </div>
//       </div>
//     </div>
//   );
// }



"use client";

import { useState, useMemo } from "react";
// import Sidebar from "@/components/Sidebar";
// import Navbar from "@/components/Navbar";
import StatsCard from "@/components/StatsCard";
import RecentOrdersTable from "@/components/RecentOrdersTable";
import SalesGraph from "@/components/SalesGraph";
import { Package, CheckCircle, ShoppingCart } from "lucide-react";

type SalesFilter = "weekly" | "monthly" | "yearly";

interface DashboardStats {
  total_orders: number;
  active_orders: number;
  completed_orders: number;
  processing_orders: number;
}

interface Order {
  id: string;
  date: string; // already formatted for display
  customer: string;
  order_status: { status: string } | { id: number; status: string };
  total_amount: number;
}

// ------- STATIC DATA (edit as you like) -------

// Stats (cards)
const STATIC_STATS: DashboardStats = {
  total_orders: 1265,
  active_orders: 142,
  completed_orders: 1087,
  processing_orders: 36,
};

// Recent orders table (last few)
const STATIC_RECENT_ORDERS: Order[] = [
  {
    id: "ORD-001234",
    date: "Sep 02, 2025",
    customer: "Aarav Sharma",
    order_status: { status: "Processing" },
    total_amount: 799,
  },
  {
    id: "ORD-001233",
    date: "Sep 01, 2025",
    customer: "Neha Patel",
    order_status: { status: "Completed" },
    total_amount: 1299,
  },
  {
    id: "ORD-001232",
    date: "Aug 31, 2025",
    customer: "Rohan Mehta",
    order_status: { status: "Completed" },
    total_amount: 549,
  },
  {
    id: "ORD-001231",
    date: "Aug 30, 2025",
    customer: "Priya Singh",
    order_status: { status: "Pending" },
    total_amount: 399,
  },
];

// Sales graph data per filter
const SALES_GRAPH_DATA = {
  weekly: [
    { day: "Aug 27", total: 22 },
    { day: "Aug 28", total: 18 },
    { day: "Aug 29", total: 25 },
    { day: "Aug 30", total: 20 },
    { day: "Aug 31", total: 28 },
    { day: "Sep 01", total: 31 },
    { day: "Sep 02", total: 27 },
  ],
  monthly: [
    { day: "Aug 05", total: 210 },
    { day: "Aug 10", total: 260 },
    { day: "Aug 15", total: 280 },
    { day: "Aug 20", total: 320 },
    { day: "Aug 25", total: 290 },
    { day: "Aug 30", total: 340 },
    { day: "Sep 02", total: 310 },
  ],
  yearly: [
    { day: "Jan", total: 1650 },
    { day: "Feb", total: 1720 },
    { day: "Mar", total: 1580 },
    { day: "Apr", total: 1890 },
    { day: "May", total: 2010 },
    { day: "Jun", total: 1950 },
    { day: "Jul", total: 2120 },
    { day: "Aug", total: 2240 },
    { day: "Sep", total: 610 }, // partial month
  ],
} as const;

// ----------------------------------------------

export default function DashboardPage() {
  const [salesFilter, setSalesFilter] = useState<SalesFilter>("monthly");

  // Since everything’s static, just memo the selected dataset.
  const salesData = useMemo(() => {
    return SALES_GRAPH_DATA[salesFilter];
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
            value={STATIC_STATS.total_orders}
            icon={<ShoppingCart className="text-blue-500" />}
          />
          <StatsCard
            title="Active Orders"
            value={STATIC_STATS.active_orders}
            icon={<Package className="text-yellow-500" />}
          />
          <StatsCard
            title="Processing Orders"
            value={STATIC_STATS.processing_orders}
            icon={<CheckCircle className="text-green-500" />}
          />
          <StatsCard
            title="Completed Orders"
            value={STATIC_STATS.completed_orders}
            icon={<CheckCircle className="text-green-500" />}
          />
        </div>

        {/* Graph Section */}
        <div className="grid grid-cols-3 gap-4 p-4">
          <div className="col-span-2">
            
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="p-2">
          <RecentOrdersTable orders={STATIC_RECENT_ORDERS} />
        </div>
      </div>
    </div>
  );
}
