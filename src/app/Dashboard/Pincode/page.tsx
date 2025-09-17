"use client";

import React, { useEffect, useState, useRef } from "react";
import CommonTable from "@/components/Table";
import CustomDialog from "@/components/Dialog";
import { TextField, FormControlLabel, Switch } from "@mui/material";
import axios from "axios";
import { BASE_URL } from "@/utils/api";
import { Button } from "@/components/ui/button";

// ✅ Define type
export interface ServicePincode {
  id: number;
  pincode: string;
  city: string;
  zone: string;
  is_active: boolean;
}

export default function ServicePincodePage() {
  const [pincodes, setPincodes] = useState<ServicePincode[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedRow, setSelectedRow] = useState<ServicePincode | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    pincode: "",
    city: "",
    zone: "",
    is_active: true,
  });

  // Errors
  const [errors, setErrors] = useState({
    pincode: "",
    city: "",
    zone: "",
  });

  // ✅ Validation
  const validate = () => {
    const tempErrors = { pincode: "", city: "", zone: "" };
    let valid = true;

    if (!formData.pincode) {
      tempErrors.pincode = "Pincode is required";
      valid = false;
    }
    if (!formData.city) {
      tempErrors.city = "City is required";
      valid = false;
    }
    if (!formData.zone) {
      tempErrors.zone = "Zone is required";
      valid = false;
    }

    setErrors(tempErrors);
    return valid;
  };

  // Fetch list
  const fetchPincodes = async (token: string | null) => {
    try {
      const res = await axios.get<ServicePincode[] | { results: ServicePincode[] }>(
        `${BASE_URL}service-pincode/`,
        { headers: { Authorization: token ? `Bearer ${token}` : "" } }
      );

      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setPincodes(data);
    } catch (err) {
      console.error("Error fetching pincodes:", err);
      setPincodes([]);
    } finally {
      setLoading(false);
    }
  };

  const didFetch = useRef(false);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;

    const token = localStorage.getItem("access_token");
    fetchPincodes(token);
  }, []);

  // Add
  const handleAddSubmit = async () => {
    if (!validate()) return;
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(`${BASE_URL}service-pincode/`, formData, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      setOpenAdd(false);
      setFormData({ pincode: "", city: "", zone: "", is_active: true });
      fetchPincodes(token);
    } catch (err) {
      console.error("Error adding pincode:", err);
    }
  };

  // Edit
  const handleEditSubmit = async () => {
    if (!selectedRow) return;
    if (!validate()) return;

    try {
      const token = localStorage.getItem("access_token");
      await axios.patch(`${BASE_URL}service-pincode/${selectedRow.id}/`, formData, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      setOpenEdit(false);
      fetchPincodes(token);
    } catch (err) {
      console.error("Error editing pincode:", err);
    }
  };

  // Delete
  const handleDeleteSubmit = async () => {
    if (!selectedRow) return;
    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(`${BASE_URL}service-pincode/${selectedRow.id}/`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      setOpenDelete(false);
      fetchPincodes(token);
    } catch (err) {
      console.error("Error deleting pincode:", err);
    }
  };

    if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl font-bold">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Service Pincodes</h1>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
          onClick={() => {
            setFormData({ pincode: "", city: "", zone: "", is_active: true });
            setErrors({ pincode: "", city: "", zone: "" });
            setOpenAdd(true);
          }}
        >
          Add Service Pincode
        </Button>
      </div>

      {/* ✅ Table */}
      <CommonTable
        data={pincodes}
        onEdit={(row) => {
          setSelectedRow(row);
          setFormData({
            pincode: row.pincode,
            city: row.city,
            zone: row.zone,
            is_active: row.is_active,
          });
          setErrors({ pincode: "", city: "", zone: "" });
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
        title="Add Service Pincode"
        onClose={() => setOpenAdd(false)}
        onSubmit={handleAddSubmit}
        submitText="Save"
      >
        <div className="flex flex-col gap-4 mt-2">
          <TextField
            label="Pincode"
            value={formData.pincode}
            onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
            error={!!errors.pincode}
            helperText={errors.pincode}
            fullWidth
          />
          <TextField
            label="City"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            error={!!errors.city}
            helperText={errors.city}
            fullWidth
          />
          <TextField
            label="Zone"
            value={formData.zone}
            onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
            error={!!errors.zone}
            helperText={errors.zone}
            fullWidth
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
            }
            label="Active"
          />
        </div>
      </CustomDialog>

      {/* ✅ Edit Dialog */}
      <CustomDialog
        open={openEdit}
        title="Edit Service Pincode"
        onClose={() => setOpenEdit(false)}
        onSubmit={handleEditSubmit}
        submitText="Update"
      >
        <div className="flex flex-col gap-4 mt-2">
          <TextField
            label="Pincode"
            value={formData.pincode}
            onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
            error={!!errors.pincode}
            helperText={errors.pincode}
            fullWidth
          />
          <TextField
            label="City"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            error={!!errors.city}
            helperText={errors.city}
            fullWidth
          />
          <TextField
            label="Zone"
            value={formData.zone}
            onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
            error={!!errors.zone}
            helperText={errors.zone}
            fullWidth
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
            }
            label="Active"
          />
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
        <p>Are you sure you want to delete this pincode?</p>
      </CustomDialog>
    </div>
  );
}
