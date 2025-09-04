"use client";

import React, { useEffect, useState, useCallback } from "react";
import CommonTable from "@/components/Table";
import { BASE_URL } from "@/utils/api";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";

type Status = { id: number; status: string };

export type Order = {
  id: number;
  customer_name: string;
  total_amount: number;
  payment_status: string;
  order_status: number | Status | string | null;
  pickup_date_time: string;
  order_created_at: string;
  name?: string;
  order_status_display?: string | { id: number; status: string };
};

type FormDataType = {
  customer_name: string;
  total_amount: number;
  payment_status: string;
  order_status: number | ""; // keep ID or "" when empty
  pickup_date_time: string;
  order_created_at: string;
};

export default function ConfirmOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [selectedRow, setSelectedRow] = useState<Order | null>(null);

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

  const mapOrderStatusToId = (row: Order, list: Status[]): number | "" => {
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
  const fetchOrders = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}confirmorder/`, {
        headers: getAuthHeaders(),
      });
      const data: Order[] = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // const fetchStatuses = useCallback(async () => {
  //   try {
  //     const response = await axios.get(`${BASE_URL}order-statuses/`, {
  //       headers: getAuthHeaders(),
  //     });
  //     setStatuses(response.data || []);
  //   } catch (error) {
  //     console.error("Error fetching order statuses:", error);
  //     setStatuses([]);
  //   }
  // }, []);

  useEffect(() => {
    fetchOrders();
    
  }, [fetchOrders]);

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
      await axios.delete(`${BASE_URL}confirmorder/${selectedRow.id}/`, {
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
        onEdit={(row: Order) => {
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
        onDelete={(row: Order) => {
          setSelectedRow(row);
          setOpenDelete(true);
        }}
      />

      {/* Add Dialog */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add New Order</DialogTitle>
        <DialogContent className="space-y-4">
          <TextField
            label="Customer Name"
            fullWidth
            value={formData.customer_name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, customer_name: e.target.value }))
            }
            error={!!errors.customer_name}
            helperText={errors.customer_name}
          />
          <TextField
            label="Total Amount"
            type="number"
            fullWidth
            value={formData.total_amount}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, total_amount: Number(e.target.value) }))
            }
            error={!!errors.total_amount}
            helperText={errors.total_amount}
          />
          <TextField
            label="Payment Status"
            fullWidth
            value={formData.payment_status}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, payment_status: e.target.value }))
            }
            error={!!errors.payment_status}
            helperText={errors.payment_status}
          />
          <TextField
            label="Order Status"
            select
            fullWidth
            value={formData.order_status}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, order_status: Number(e.target.value) }))
            }
            error={!!errors.order_status}
            helperText={errors.order_status}
          >
            {statuses.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.status}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Pickup Date & Time"
            type="datetime-local"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.pickup_date_time}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, pickup_date_time: e.target.value }))
            }
            error={!!errors.pickup_date_time}
            helperText={errors.pickup_date_time}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button onClick={handleAddSubmit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit Order</DialogTitle>
        <DialogContent className="space-y-4">
          <TextField
            label="Customer Name"
            fullWidth
            value={formData.customer_name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, customer_name: e.target.value }))
            }
            error={!!errors.customer_name}
            helperText={errors.customer_name}
          />
          <TextField
            label="Total Amount"
            type="number"
            fullWidth
            value={formData.total_amount}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, total_amount: Number(e.target.value) }))
            }
            error={!!errors.total_amount}
            helperText={errors.total_amount}
          />
          <TextField
            label="Payment Status"
            fullWidth
            value={formData.payment_status}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, payment_status: e.target.value }))
            }
            error={!!errors.payment_status}
            helperText={errors.payment_status}
          />
          <TextField
            label="Order Status"
            select
            fullWidth
            value={formData.order_status}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, order_status: Number(e.target.value) }))
            }
            error={!!errors.order_status}
            helperText={errors.order_status}
          >
            {statuses.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.status}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Pickup Date & Time"
            type="datetime-local"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.pickup_date_time}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, pickup_date_time: e.target.value }))
            }
            error={!!errors.pickup_date_time}
            helperText={errors.pickup_date_time}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Delete Order</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this order?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
          <Button onClick={handleDeleteSubmit} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
