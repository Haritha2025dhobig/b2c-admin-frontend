"use client";

import React, { useEffect, useState } from "react";
import CommonTable from "@/components/Table";
import CustomDialog from "@/components/Dialog";
import { TextField, MenuItem } from "@mui/material";
import { BASE_URL } from "@/utils/api";
import axios from "axios";

type Status = { id: number; status: string };

type FormDataType = {
  customer_name: string;
  total_amount: number;
  payment_status: string;
  order_status: number | ""; // keep ID or "" when empty
  pickup_date_time: string;
  order_created_at: string;
};

export default function ConfirmOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  const [formData, setFormData] = useState<FormDataType>({
    customer_name: "",
    total_amount: 0,
    payment_status: "",
    order_status: "",
    pickup_date_time: "",
    order_created_at: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [statuses, setStatuses] = useState<Status[]>([]);

  // --- Helpers ---------------------------------------------------------------

  const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const mapOrderStatusToId = (row: any, list: Status[]): number | "" => {
    const raw = row?.order_status ?? row?.order_status_display;
    if (typeof raw === "number" && Number.isFinite(raw)) return raw;
    if (raw && typeof raw === "object" && "id" in raw && Number.isFinite(raw.id)) {
      return Number(raw.id);
    }
    const name =
      typeof raw === "string"
        ? raw
        : typeof row?.order_status_display === "string"
        ? row.order_status_display
        : undefined;
    if (name && list?.length) {
      const hit = list.find(
        (s) => s.status.trim().toLowerCase() === name.trim().toLowerCase()
      );
      if (hit) return hit.id;
    }
    return "";
  };

  const resetForm = () =>
    setFormData({
      customer_name: "",
      total_amount: 0,
      payment_status: "",
      order_status: "",
      pickup_date_time: "",
      order_created_at: "",
    });

  // --- Data fetching ---------------------------------------------------------

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${BASE_URL}confirmorder/`, {
        headers: getAuthHeaders(),
      });
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatuses = async () => {
    try {
      const response = await axios.get(`${BASE_URL}order-statuses/`, {
        headers: getAuthHeaders(),
      });
      setStatuses(response.data || []);
    } catch (error) {
      console.error("Error fetching order statuses:", error);
      setStatuses([]);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStatuses();
  }, []);

  // --- Validation ------------------------------------------------------------

  const validateForm = () => {
    const temp: Record<string, string> = {};
    if (!formData.customer_name) temp.customer_name = "Customer name is required";
    if (!formData.total_amount || formData.total_amount <= 0)
      temp.total_amount = "Total amount must be greater than 0";
    if (!formData.payment_status) temp.payment_status = "Payment status is required";
    if (formData.order_status === "") temp.order_status = "Order status is required";
    if (!formData.pickup_date_time)
      temp.pickup_date_time = "Pickup date & time is required";
    if (!formData.order_created_at && openEdit)
      temp.order_created_at = "Order created date is required";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  // --- CRUD handlers ---------------------------------------------------------

  const handleAddSubmit = async () => {
    if (!validateForm()) return;
    try {
      await axios.post(
        `${BASE_URL}confirmorder/`,
        {
          ...formData,
          order_status:
            formData.order_status === "" ? undefined : Number(formData.order_status),
        },
        { headers: getAuthHeaders() }
      );
      setOpenAdd(false);
      resetForm();
      setErrors({});
      fetchOrders();
    } catch (error) {
      console.error("Error adding order:", error);
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedRow) return;
    if (!validateForm()) return;

    try {
      await axios.patch(
        `${BASE_URL}confirmorder/${selectedRow.id}/`,
        {
          order_status:
            formData.order_status === "" ? null : Number(formData.order_status),
        },
        { headers: getAuthHeaders() }
      );
      setOpenEdit(false);
      resetForm();
      setErrors({});
      fetchOrders();
    } catch (error) {
      console.error("Error editing order:", error);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedRow) return;
    try {
      await axios.delete(`${BASE_URL}confirmorder//${selectedRow.id}/`, {
        headers: getAuthHeaders(),
      });
      setOpenDelete(false);
      fetchOrders();
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  if (loading) return <p>Loading...</p>;

  // --- Render ----------------------------------------------------------------

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Confirm Orders</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
          onClick={() => {
            resetForm();
            setErrors({});
            setOpenAdd(true);
          }}
        >
          + Add Order
        </button>
      </div>

      {/* Orders Table */}
      <CommonTable
        data={orders}
        onEdit={(row) => {
          setSelectedRow(row);
          setFormData({
            customer_name: row.customer_name ?? row.name ?? "",
            total_amount: row.total_amount ?? 0,
            payment_status: row.payment_status ?? "",
            order_status: mapOrderStatusToId(row, statuses),
            pickup_date_time: row.pickup_date_time ?? "",
            order_created_at: row.order_created_at ?? "",
          });
          setErrors({});
          setOpenEdit(true);
        }}
        onDelete={(row) => {
          setSelectedRow(row);
          setOpenDelete(true);
        }}
      />

      {/* Add, Edit, Delete Dialogs remain unchanged */}
      {/* ✅ Your existing dialogs go here */}
    </div>
  );
}
