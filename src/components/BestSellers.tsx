"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";


const bestSellers = [
  { name: "Lorem Ipsum", price: "₹126.50", sales: 999 },
  { name: "Lorem Ipsum", price: "₹126.50", sales: 999 },
  { name: "Lorem Ipsum", price: "₹126.50", sales: 999 },
];

export default function BestSellers() {
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-3">Best Sellers</h3>
      {bestSellers.map((item, i) => (
        <CardContent key={i} className="flex justify-between items-center p-2">
          <span>{item.name}</span>
          <span className="font-bold">{item.price}</span>
        </CardContent>
      ))}
      <Button className="w-full mt-2">Report</Button>
    </Card>
  );
}
