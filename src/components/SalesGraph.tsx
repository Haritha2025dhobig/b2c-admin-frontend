"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SalesData {
  day: string;
  total: number;
}

interface SalesGraphProps {
  data: SalesData[];
  filter: "weekly" | "monthly" | "yearly";
  onFilterChange: (filter: "weekly" | "monthly" | "yearly") => void;
}

export default function SalesGraph({ data, filter, onFilterChange }: SalesGraphProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow">
      <div className="flex justify-between mb-2">
        <h3 className="font-semibold">Sale Graph</h3>
        <div className="flex gap-2 text-sm">
          <button
            className={`px-2 py-1 rounded ${filter === "weekly" ? "bg-blue-500 text-white" : "bg-gray-100"}`}
            onClick={() => onFilterChange("weekly")}
          >
            Weekly
          </button>
          <button
            className={`px-2 py-1 rounded ${filter === "monthly" ? "bg-blue-500 text-white" : "bg-gray-100"}`}
            onClick={() => onFilterChange("monthly")}
          >
            Monthly
          </button>
          <button
            className={`px-2 py-1 rounded ${filter === "yearly" ? "bg-blue-500 text-white" : "bg-gray-100"}`}
            onClick={() => onFilterChange("yearly")}
          >
            Yearly
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
