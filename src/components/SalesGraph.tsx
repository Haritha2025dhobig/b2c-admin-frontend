"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "JUL", sales: 50 },
  { month: "AUG", sales: 60 },
  { month: "SEP", sales: 80 },
  { month: "OCT", sales: 70 },
  { month: "NOV", sales: 120 },
  { month: "DEC", sales: 300 },
];

export default function SalesGraph() {
  return (
    <div className="bg-white rounded-xl p-4 shadow">
      <div className="flex justify-between mb-2">
        <h3 className="font-semibold">Sale Graph</h3>
        <div className="flex gap-2 text-sm">
          <button className="px-2 py-1 rounded bg-gray-100">Weekly</button>
          <button className="px-2 py-1 rounded bg-blue-500 text-white">Monthly</button>
          <button className="px-2 py-1 rounded bg-gray-100">Yearly</button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
