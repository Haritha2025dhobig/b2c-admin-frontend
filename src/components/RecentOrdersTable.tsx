"use client";
const orders = [
  { id: "#25426", date: "Nov 8th,2023", customer: "Kavin", status: "Delivered", amount: "₹200.00" },
  { id: "#25425", date: "Nov 7th,2023", customer: "Komael", status: "Canceled", amount: "₹200.00" },
  { id: "#25424", date: "Nov 6th,2023", customer: "Nikhil", status: "Delivered", amount: "₹200.00" },
];

export default function RecentOrdersTable() {
  return (
    <div className="bg-white rounded-xl p-4 shadow mt-4">
      <h3 className="font-semibold mb-3">Recent Orders</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b">
            <th className="p-2">Product</th>
            <th className="p-2">Order ID</th>
            <th className="p-2">Date</th>
            <th className="p-2">Customer</th>
            <th className="p-2">Status</th>
            <th className="p-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o, i) => (
            <tr key={i} className="border-b">
              <td className="p-2">Lorem Ipsum</td>
              <td className="p-2">{o.id}</td>
              <td className="p-2">{o.date}</td>
              <td className="p-2">{o.customer}</td>
              <td className="p-2">{o.status}</td>
              <td className="p-2">{o.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
