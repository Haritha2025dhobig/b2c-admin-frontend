"use client";
import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

export default function StatsCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <Card className="flex-1">
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm text-gray-500">{title}</h3>
          <p className="text-xl font-bold">{value}</p>
          <span className="text-xs text-gray-400">Compared to Oct 2023</span>
        </div>
        {icon}
      </CardContent>
    </Card>
  );
}
