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

  // Map whatever backend sent to a status ID we can use in the select
  const mapOrderStatusToId = (row: any, list: Status[]): number | "" => {
    const raw = row?.order_status ?? row?.order_status_display;

    // Already a number (id)?
    if (typeof raw === "number" && Number.isFinite(raw)) return raw;

    // Object with id?
    if (raw && typeof raw === "object" && "id" in raw && Number.isFinite(raw.id)) {
      return Number(raw.id);
    }

    // String name -> find id in statuses
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

    // Fallback: empty (keeps the select controlled)
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
      const response = await axios.get(`${BASE_URL}orders/`);
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
      const response = await axios.get(`${BASE_URL}order-statuses/`);
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
      // If your backend expects order_status id on create, this is ready.
      await axios.post(`${BASE_URL}orders/`, {
        ...formData,
        // ensure number or omit
        order_status:
          formData.order_status === "" ? undefined : Number(formData.order_status),
      });
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
      await axios.patch(`${BASE_URL}orders/${selectedRow.id}/`, {
        order_status:
          formData.order_status === "" ? null : Number(formData.order_status),
      });
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
      await axios.delete(`${BASE_URL}orders/${selectedRow.id}/`);
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

      {/* Add Order Dialog */}
      <CustomDialog
        open={openAdd}
        title="Add Order"
        onClose={() => setOpenAdd(false)}
        onSubmit={handleAddSubmit}
        submitText="Create Order"
      >
        <div className="flex flex-col gap-4 mt-2">
          <TextField
            label="Customer Name"
            name="customer_name"
            value={formData.customer_name}
            onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
            error={!!errors.customer_name}
            helperText={errors.customer_name}
            fullWidth
          />

          <TextField
            label="Total Amount"
            name="total_amount"
            type="number"
            value={Number.isFinite(formData.total_amount) ? formData.total_amount : 0}
            onChange={(e) =>
              setFormData({
                ...formData,
                total_amount: e.target.value === "" ? 0 : Number(e.target.value),
              })
            }
            error={!!errors.total_amount}
            helperText={errors.total_amount}
            fullWidth
          />

          <TextField
            label="Payment Status"
            name="payment_status"
            value={formData.payment_status}
            onChange={(e) =>
              setFormData({ ...formData, payment_status: e.target.value })
            }
            error={!!errors.payment_status}
            helperText={errors.payment_status}
            fullWidth
          />

          <TextField
            select
            label="Order Status"
            name="order_status"
            value={formData.order_status === "" ? "" : Number(formData.order_status)}
            onChange={(e) =>
              setFormData({
                ...formData,
                order_status:
                  e.target.value === "" ? "" : Number(e.target.value),
              })
            }
            error={!!errors.order_status}
            helperText={errors.order_status}
            fullWidth
          >
            {statuses.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.status}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Pickup Date & Time"
            name="pickup_date_time"
            value={formData.pickup_date_time}
            onChange={(e) =>
              setFormData({ ...formData, pickup_date_time: e.target.value })
            }
            error={!!errors.pickup_date_time}
            helperText={errors.pickup_date_time}
            fullWidth
          />
        </div>
      </CustomDialog>

      {/* Edit Order Dialog */}
      <CustomDialog
        open={openEdit}
        title="Edit Order"
        onClose={() => setOpenEdit(false)}
        onSubmit={handleEditSubmit}
        submitText="Update Order"
      >
        <div className="flex flex-col gap-4 mt-2">
          <TextField
            label="Customer Name"
            name="customer_name"
            value={formData.customer_name}
            onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
            error={!!errors.customer_name}
            helperText={errors.customer_name}
            fullWidth
          />

          <TextField
            label="Total Amount"
            name="total_amount"
            value={Number.isFinite(formData.total_amount) ? formData.total_amount : 0}
            onChange={(e) =>
              setFormData({
                ...formData,
                total_amount: e.target.value === "" ? 0 : Number(e.target.value),
              })
            }
            error={!!errors.total_amount}
            helperText={errors.total_amount}
            fullWidth
          />

          <TextField
            label="Payment Status"
            name="payment_status"
            value={formData.payment_status}
            onChange={(e) =>
              setFormData({ ...formData, payment_status: e.target.value })
            }
            error={!!errors.payment_status}
            helperText={errors.payment_status}
            fullWidth
          />

          <TextField
            select
            label="Order Status"
            name="order_status"
            value={formData.order_status === "" ? "" : Number(formData.order_status)}
            onChange={(e) =>
              setFormData({
                ...formData,
                order_status:
                  e.target.value === "" ? "" : Number(e.target.value),
              })
            }
            error={!!errors.order_status}
            helperText={errors.order_status}
            fullWidth
          >
            {statuses.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.status}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Pickup Date & Time"
            name="pickup_date_time"
            value={formData.pickup_date_time}
            onChange={(e) =>
              setFormData({ ...formData, pickup_date_time: e.target.value })
            }
            error={!!errors.pickup_date_time}
            helperText={errors.pickup_date_time}
            fullWidth
          />

          <TextField
            label="Order Created At"
            name="order_created_at"
            value={formData.order_created_at}
            onChange={(e) =>
              setFormData({ ...formData, order_created_at: e.target.value })
            }
            error={!!errors.order_created_at}
            helperText={errors.order_created_at}
            fullWidth
          />
        </div>
      </CustomDialog>

      {/* Delete Order Dialog */}
      <CustomDialog
        open={openDelete}
        title="Confirm Delete"
        onClose={() => setOpenDelete(false)}
        onSubmit={handleDeleteSubmit}
        submitText="Delete"
        cancelText="Cancel"
      >
        <p>Are you sure you want to delete this order?</p>
      </CustomDialog>
    </div>
  );
}
