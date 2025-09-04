"use client";

import React, { useEffect, useState } from "react";
import CommonTable from "@/components/Table";
import { BASE_URL } from "@/utils/api";
import axios from "axios";

export interface PendingOrder {
  id: number;
  sso_uuid?: string;
  pickup_date_time?: string;
  total_amount?: number;
  name?: string;
  mobile_no?: string;
  full_address?: string;
  order_created_at?: string;
  payment_status?: string;
  order_status?: string | { id: number; status: string };
}

export default function PendingOrdersPage() {
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          console.error("No token found in localStorage");
          setOrders([]);
          setLoading(false);
          return;
        }

        const response = await axios.get<PendingOrder[] | { results: PendingOrder[] }>(
          `${BASE_URL}pending-orders/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = Array.isArray(response.data)
          ? response.data
          : response.data.results || [];

        setOrders(data);
      } catch (error) {
        console.error("Error fetching pending orders:", error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <p>Loading...</p>;

  return <CommonTable data={orders} />;
}
