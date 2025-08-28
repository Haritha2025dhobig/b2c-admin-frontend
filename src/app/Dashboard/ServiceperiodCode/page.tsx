"use client";

import React, { useEffect, useState } from "react";
import CommonTable from "@/components/Table";
import CustomDialog from "@/components/Dialog";
import { TextField } from "@mui/material";
import axios from "axios";
import { BASE_URL } from "@/utils/api";
import { Button } from "@/components/ui/button";

export default function ServiceDeliveryCodesPage() {
  const [codes, setCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    service_name: "",
    service_period_name: "",
    price_type_name: "",
    opening_time: "",
    closing_time: "",
    min_quantity: "",
    turnaround_time: "",
    service_period_price: "",
    pickup_delivery_cost: "",
  });

  // ❌ Validation Errors
  const [errors, setErrors] = useState({
    service_name: "",
    service_period_name: "",
    price_type_name: "",
    opening_time: "",
    closing_time: "",
    min_quantity: "",
    turnaround_time: "",
    service_period_price: "",
    pickup_delivery_cost: "",
  });

  // ✅ Validation function
  const validate = () => {
    let tempErrors = { ...errors };
    let isValid = true;

    Object.entries(formData).forEach(([key, value]) => {
      if (!value) {
        tempErrors[key as keyof typeof errors] = `${key.replaceAll("_", " ")} is required`;
        isValid = false;
      } else {
        tempErrors[key as keyof typeof errors] = "";
      }
    });

    setErrors(tempErrors);
    return isValid;
  };

  // ✅ Fetch codes
  const fetchCodes = async () => {
    try {
      const response = await axios.get(`${BASE_URL}service-delivery-codes/`);
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
      setCodes(data);
    } catch (error) {
      console.error("Error fetching service delivery codes:", error);
      setCodes([]);
    } finally {
      setLoading(false);
    }
  };

const didFetch = React.useRef(false);

useEffect(() => {
  if (didFetch.current) return;
  didFetch.current = true;
  fetchCodes();
}, []);

  // ✅ Add
  const handleAddSubmit = async () => {
    if (!validate()) return;

    try {
      await axios.post(`${BASE_URL}service-delivery-codes/`, formData);
      setOpenAdd(false);
      setFormData({
        service_name: "",
        service_period_name: "",
        price_type_name: "",
        opening_time: "",
        closing_time: "",
        min_quantity: "",
        turnaround_time: "",
        service_period_price: "",
        pickup_delivery_cost: "",
      });
      fetchCodes();
    } catch (error) {
      console.error("Error adding service delivery code:", error);
    }
  };

  // ✅ Edit
  const handleEditSubmit = async () => {
    if (!selectedRow) return;
    if (!validate()) return;

    try {
      await axios.patch(`${BASE_URL}service-delivery-codes/${selectedRow.id}/`, formData);
      setOpenEdit(false);
      fetchCodes();
    } catch (error) {
      console.error("Error editing service delivery code:", error);
    }
  };

  // ✅ Delete
  const handleDeleteSubmit = async () => {
    if (!selectedRow) return;
    try {
      await axios.delete(`${BASE_URL}service-delivery-codes/${selectedRow.id}/`);
      setOpenDelete(false);
      fetchCodes();
    } catch (error) {
      console.error("Error deleting service delivery code:", error);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Service Delivery Codes</h1>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
          onClick={() => {
            setFormData({
              service_name: "",
              service_period_name: "",
              price_type_name: "",
              opening_time: "",
              closing_time: "",
              min_quantity: "",
              turnaround_time: "",
              service_period_price: "",
              pickup_delivery_cost: "",
            });
            setErrors({
              service_name: "",
              service_period_name: "",
              price_type_name: "",
              opening_time: "",
              closing_time: "",
              min_quantity: "",
              turnaround_time: "",
              service_period_price: "",
              pickup_delivery_cost: "",
            });
            setOpenAdd(true);
          }}
        >
          Add New Code
        </Button>
      </div>

      {/* ✅ Table with Edit/Delete actions */}
      <CommonTable
        data={codes}
        onEdit={(row) => {
          setSelectedRow(row);
          setFormData({ ...row });
          setOpenEdit(true);
        }}
        onDelete={(row) => {
          setSelectedRow(row);
          setOpenDelete(true);
        }}
      />

      {/* ✅ Add Dialog */}
      <CustomDialog
        open={openAdd}
        title="Add New Service Delivery Code"
        onClose={() => setOpenAdd(false)}
        onSubmit={handleAddSubmit}
        submitText="Save"
      >
        <div className="flex flex-col gap-4 mt-2">
          {Object.keys(formData).map((field) => (
            <TextField
              key={field}
              label={field.replaceAll("_", " ")}
              name={field}
              value={(formData as any)[field]}
              onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
              error={!!(errors as any)[field]}
              helperText={(errors as any)[field]}
              fullWidth
            />
          ))}
        </div>
      </CustomDialog>

      {/* ✅ Edit Dialog */}
      <CustomDialog
        open={openEdit}
        title="Edit Service Delivery Code"
        onClose={() => setOpenEdit(false)}
        onSubmit={handleEditSubmit}
        submitText="Update"
      >
        <div className="flex flex-col gap-4 mt-2">
          {Object.keys(formData).map((field) => (
            <TextField
              key={field}
              label={field.replaceAll("_", " ")}
              name={field}
              value={(formData as any)[field]}
              onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
              error={!!(errors as any)[field]}
              helperText={(errors as any)[field]}
              fullWidth
            />
          ))}
        </div>
      </CustomDialog>

      {/* ✅ Delete Confirmation */}
      <CustomDialog
        open={openDelete}
        title="Confirm Delete"
        onClose={() => setOpenDelete(false)}
        onSubmit={handleDeleteSubmit}
        submitText="Delete"
        cancelText="Cancel"
      >
        <p>Are you sure you want to delete this service delivery code?</p>
      </CustomDialog>
    </div>
  );
}
