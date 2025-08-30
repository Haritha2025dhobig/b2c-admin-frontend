"use client";
import React from "react";
import { formatDate } from "@/utils/date";

// Use the same type as the mapped API response
interface RecentOrdersTableProps {
  orders: {
    id: string;
    sso_uuid?: string;
    order_created_at?: string | null;
    full_address?: string;
    name?: string | null;
    order_status?: { status: string } | null;
    total_amount?: number;
  }[];
}

export default function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow mt-4">
      <h3 className="font-semibold mb-3">Recent Orders</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b">
            <th className="p-2">Order ID</th>
            <th className="p-2">Order Date</th>
            <th className="p-2">Customer</th>
            <th className="p-2">Address</th>
            <th className="p-2">Status</th>
            <th className="p-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o, i) => (
            <tr key={i} className="border-b">
              <td className="p-2">{o.id || "N/A"}</td>
              <td className="p-2">
                {o.order_created_at
                  ? formatDate(o.order_created_at)
                  : "N/A"}
              </td>
              <td className="p-2">{o.name || "N/A"}</td>
              <td className="p-2">{o.full_address || "N/A"}</td>
              <td className="p-2">{o.order_status?.status ?? "Pending"}</td>
              <td className="p-2">
                ₹{o.total_amount != null ? o.total_amount.toFixed(2) : "0.00"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
