"use client";

import React, { useEffect, useState } from "react";
import CommonTable from "@/components/Table";
import CustomDialog from "@/components/Dialog";
import { TextField } from "@mui/material";
import axios from "axios";
import { BASE_URL } from "@/utils/api";
import { Button } from "@/components/ui/button";

export default function ServicePeriodPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    service_period_code: "",
    service_period_name: "",
    service_period_description: "",
  });

  // Validation errors
  const [errors, setErrors] = useState({
    service_period_code: "",
    service_period_name: "",
    service_period_description: "",
  });

  // ✅ Validation function
  const validate = () => {
    let tempErrors = {
      service_period_code: "",
      service_period_name: "",
      service_period_description: "",
    };
    let isValid = true;

    if (!formData.service_period_code) {
      tempErrors.service_period_code = "Service Code is required";
      isValid = false;
    }
    if (!formData.service_period_name) {
      tempErrors.service_period_name = "Service Name is required";
      isValid = false;
    }
    if (!formData.service_period_description) {
      tempErrors.service_period_description = "Service Description is required";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${BASE_URL}service-periods/`);
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
      setServices(data);
    } catch (error) {
      console.error("Error fetching service periods:", error);
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

  // Add Service Period
  const handleAddSubmit = async () => {
    if (!validate()) return;

    try {
      await axios.post(`${BASE_URL}service-periods/`, formData);
      setOpenAdd(false);
      setFormData({
        service_period_code: "",
        service_period_name: "",
        service_period_description: "",
      });
      setErrors({
        service_period_code: "",
        service_period_name: "",
        service_period_description: "",
      });
      fetchServices();
    } catch (error) {
      console.error("Error adding service period:", error);
    }
  };

  // Edit Service Period
  const handleEditSubmit = async () => {
    if (!selectedRow) return;
    if (!validate()) return;

    try {
      await axios.patch(`${BASE_URL}service-periods/${selectedRow.id}/`, formData);
      setOpenEdit(false);
      setErrors({
        service_period_code: "",
        service_period_name: "",
        service_period_description: "",
      });
      fetchServices();
    } catch (error) {
      console.error("Error editing service period:", error);
    }
  };

  // Delete Service Period
  const handleDeleteSubmit = async () => {
    if (!selectedRow) return;
    try {
      await axios.delete(`${BASE_URL}service-periods/${selectedRow.id}/`);
      setOpenDelete(false);
      fetchServices();
    } catch (error) {
      console.error("Error deleting service period:", error);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Service Period</h1>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
          onClick={() => {
            setFormData({
              service_period_code: "",
              service_period_name: "",
              service_period_description: "",
            });
            setErrors({
              service_period_code: "",
              service_period_name: "",
              service_period_description: "",
            });
            setOpenAdd(true);
          }}
        >
          Add Service Period
        </Button>
      </div>

      {/* ✅ Table with Edit/Delete */}
      <CommonTable
        data={services}
        onEdit={(row) => {
          setSelectedRow(row);
          setFormData({
            service_period_code: row.service_period_code,
            service_period_name: row.service_period_name,
            service_period_description: row.service_period_description,
          });
          setErrors({
            service_period_code: "",
            service_period_name: "",
            service_period_description: "",
          });
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
        title="Add New Service Period"
        onClose={() => setOpenAdd(false)}
        onSubmit={handleAddSubmit}
        submitText="Save Service"
      >
        <div className="flex flex-col gap-4 mt-2">
          <TextField
            label="Service Code"
            name="service_period_code"
            value={formData.service_period_code}
            onChange={(e) =>
              setFormData({ ...formData, service_period_code: e.target.value })
            }
            error={!!errors.service_period_code}
            helperText={errors.service_period_code}
            fullWidth
          />
          <TextField
            label="Service Name"
            name="service_period_name"
            value={formData.service_period_name}
            onChange={(e) =>
              setFormData({ ...formData, service_period_name: e.target.value })
            }
            error={!!errors.service_period_name}
            helperText={errors.service_period_name}
            fullWidth
          />
          <TextField
            label="Service Description"
            name="service_period_description"
            value={formData.service_period_description}
            onChange={(e) =>
              setFormData({
                ...formData,
                service_period_description: e.target.value,
              })
            }
            error={!!errors.service_period_description}
            helperText={errors.service_period_description}
            fullWidth
            multiline
            rows={3}
          />
        </div>
      </CustomDialog>

      {/* ✅ Edit Dialog */}
      <CustomDialog
        open={openEdit}
        title="Edit Service Period"
        onClose={() => setOpenEdit(false)}
        onSubmit={handleEditSubmit}
        submitText="Update Service"
      >
        <div className="flex flex-col gap-4 mt-2">
          <TextField
            label="Service Code"
            name="service_period_code"
            value={formData.service_period_code}
            onChange={(e) =>
              setFormData({ ...formData, service_period_code: e.target.value })
            }
            error={!!errors.service_period_code}
            helperText={errors.service_period_code}
            fullWidth
          />
          <TextField
            label="Service Name"
            name="service_period_name"
            value={formData.service_period_name}
            onChange={(e) =>
              setFormData({ ...formData, service_period_name: e.target.value })
            }
            error={!!errors.service_period_name}
            helperText={errors.service_period_name}
            fullWidth
          />
          <TextField
            label="Service Description"
            name="service_period_description"
            value={formData.service_period_description}
            onChange={(e) =>
              setFormData({
                ...formData,
                service_period_description: e.target.value,
              })
            }
            error={!!errors.service_period_description}
            helperText={errors.service_period_description}
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
        <p>Are you sure you want to delete this service period?</p>
      </CustomDialog>
    </div>
  );
}
