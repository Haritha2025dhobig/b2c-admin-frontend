"use client";

import React, { useEffect, useState } from "react";
import CommonTable from "@/components/Table";
import CustomDialog from "@/components/Dialog";
import { TextField } from "@mui/material";
import axios from "axios";
import { BASE_URL } from "@/utils/api";
import { Button } from "@/components/ui/button";

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    service_code: "",
    service_name: "",
    service_description: "",
  });

  // ❌ Validation Errors
  const [errors, setErrors] = useState({
    service_code: "",
    service_name: "",
    service_description: "",
  });

  // ✅ Validation function
  const validate = () => {
    let tempErrors = { service_code: "", service_name: "", service_description: "" };
    let isValid = true;

    if (!formData.service_code) {
      tempErrors.service_code = "Service Code is required";
      isValid = false;
    }
    if (!formData.service_name) {
      tempErrors.service_name = "Service Name is required";
      isValid = false;
    }
    if (!formData.service_description) {
      tempErrors.service_description = "Service Description is required";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  // ✅ Fetch services
  const fetchServices = async () => {
    try {
      const response = await axios.get(`${BASE_URL}services/`);
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
      setServices(data);
    } catch (error) {
      console.error("Error fetching services:", error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

const didFetch = React.useRef(false);

useEffect(() => {
  if (didFetch.current) return;
  didFetch.current = true;
  fetchServices();
}, []);


  // ✅ Add Service
  const handleAddSubmit = async () => {
    if (!validate()) return;

    try {
      await axios.post(`${BASE_URL}services/`, formData);
      setOpenAdd(false);
      setFormData({ service_code: "", service_name: "", service_description: "" });
      setErrors({ service_code: "", service_name: "", service_description: "" });
      fetchServices();
    } catch (error) {
      console.error("Error adding service:", error);
    }
  };

  // ✅ Edit Service
  const handleEditSubmit = async () => {
    if (!selectedRow) return;
    if (!validate()) return;

    try {
      await axios.patch(`${BASE_URL}services/${selectedRow.id}/`, formData);
      setOpenEdit(false);
      setErrors({ service_code: "", service_name: "", service_description: "" });
      fetchServices();
    } catch (error) {
      console.error("Error editing service:", error);
    }
  };

  // ✅ Delete Service
  const handleDeleteSubmit = async () => {
    if (!selectedRow) return;
    try {
      await axios.delete(`${BASE_URL}services/${selectedRow.id}/`);
      setOpenDelete(false);
      fetchServices();
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Services</h1>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
          onClick={() => {
            setFormData({ service_code: "", service_name: "", service_description: "" });
            setErrors({ service_code: "", service_name: "", service_description: "" });
            setOpenAdd(true);
          }}
        >
          Add New Service
        </Button>
      </div>

      {/* ✅ Table with Edit/Delete actions */}
      <CommonTable
        data={services}
        onEdit={(row) => {
          setSelectedRow(row);
          setFormData({
            service_code: row.service_code,
            service_name: row.service_name,
            service_description: row.service_description,
          });
          setErrors({ service_code: "", service_name: "", service_description: "" });
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
        title="Add New Service"
        onClose={() => setOpenAdd(false)}
        onSubmit={handleAddSubmit}
        submitText="Save Service"
      >
        <div className="flex flex-col gap-4 mt-2">
          <TextField
            label="Service Code"
            name="service_code"
            value={formData.service_code}
            onChange={(e) => setFormData({ ...formData, service_code: e.target.value })}
            error={!!errors.service_code}
            helperText={errors.service_code}
            fullWidth
          />
          <TextField
            label="Service Name"
            name="service_name"
            value={formData.service_name}
            onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
            error={!!errors.service_name}
            helperText={errors.service_name}
            fullWidth
          />
          <TextField
            label="Service Description"
            name="service_description"
            value={formData.service_description}
            onChange={(e) => setFormData({ ...formData, service_description: e.target.value })}
            error={!!errors.service_description}
            helperText={errors.service_description}
            fullWidth
            multiline
            rows={3}
          />
        </div>
      </CustomDialog>

      {/* ✅ Edit Dialog */}
      <CustomDialog
        open={openEdit}
        title="Edit Service"
        onClose={() => setOpenEdit(false)}
        onSubmit={handleEditSubmit}
        submitText="Update Service"
      >
        <div className="flex flex-col gap-4 mt-2">
          <TextField
            label="Service Code"
            name="service_code"
            value={formData.service_code}
            onChange={(e) => setFormData({ ...formData, service_code: e.target.value })}
            error={!!errors.service_code}
            helperText={errors.service_code}
            fullWidth
          />
          <TextField
            label="Service Name"
            name="service_name"
            value={formData.service_name}
            onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
            error={!!errors.service_name}
            helperText={errors.service_name}
            fullWidth
          />
          <TextField
            label="Service Description"
            name="service_description"
            value={formData.service_description}
            onChange={(e) => setFormData({ ...formData, service_description: e.target.value })}
            error={!!errors.service_description}
            helperText={errors.service_description}
            fullWidth
            multiline
            rows={3}
          />
        </div>
      </CustomDialog>

      {/* ✅ Delete Confirmation using CustomDialog */}
      <CustomDialog
        open={openDelete}
        title="Confirm Delete"
        onClose={() => setOpenDelete(false)}
        onSubmit={handleDeleteSubmit}
        submitText="Delete"
        cancelText="Cancel"
      >
        <p>Are you sure you want to delete this service?</p>
      </CustomDialog>
    </div>
  );
}
