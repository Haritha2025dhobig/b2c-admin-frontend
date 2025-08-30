"use client";
import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

export default function StatsCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: ReactNode;
}) {
  return (
    <Card className="flex-1">
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm text-gray-500">{title}</h3>
          <p className="text-xl font-bold">{value}</p>
          
        </div>
        {icon}
      </CardContent>
    </Card>
  );
}
