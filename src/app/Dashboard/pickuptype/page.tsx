"use client";

import React, { useEffect, useState } from "react";
import CommonTable from "@/components/Table";
import CustomDialog from "@/components/Dialog";
import { TextField } from "@mui/material";
import axios from "axios";
import { BASE_URL } from "@/utils/api";
import { Button } from "@/components/ui/button";

export interface Pickup {
  id: number;
  pickup_code: string;
  pickup_name: string;
}

export default function PickupPage() {
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState(true);

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [selectedRow, setSelectedRow] = useState<Pickup | null>(null);

  const [formData, setFormData] = useState({
    pickup_code: "",
    pickup_name: "",
  });

  const [errors, setErrors] = useState({
    pickup_code: "",
    pickup_name: "",
  });

  const validate = () => {
    const tempErrors = { pickup_code: "", pickup_name: "" }; // ✅ use const
    let isValid = true;

    if (!formData.pickup_code) {
      tempErrors.pickup_code = "Pickup Code is required";
      isValid = false;
    }
    if (!formData.pickup_name) {
      tempErrors.pickup_name = "Pickup Name is required";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const fetchPickups = async () => {
    try {
      const response = await axios.get<Pickup[] | { results: Pickup[] }>(
        `${BASE_URL}pickups/`
      );
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
      setPickups(data);
    } catch (error) {
      console.error("Error fetching pickups:", error);
      setPickups([]);
    } finally {
      setLoading(false);
    }
  };

  const didFetch = React.useRef(false);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    fetchPickups();
  }, []);

  const handleAddSubmit = async () => {
    if (!validate()) return;
    try {
      await axios.post(`${BASE_URL}pickups/`, formData);
      setOpenAdd(false);
      setFormData({ pickup_code: "", pickup_name: "" });
      setErrors({ pickup_code: "", pickup_name: "" });
      fetchPickups();
    } catch (error) {
      console.error("Error adding pickup:", error);
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedRow) return;
    if (!validate()) return;
    try {
      await axios.patch(`${BASE_URL}pickups/${selectedRow.id}/`, formData);
      setOpenEdit(false);
      setErrors({ pickup_code: "", pickup_name: "" });
      fetchPickups();
    } catch (error) {
      console.error("Error editing pickup:", error);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedRow) return;
    try {
      await axios.delete(`${BASE_URL}pickups/${selectedRow.id}/`);
      setOpenDelete(false);
      fetchPickups();
    } catch (error) {
      console.error("Error deleting pickup:", error);
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
      <div className="flex  justify-end">
        {/* <h1 className="text-xl font-semibold">Pickups</h1> */}
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white mt-3 ml-3"
          size="lg"
          onClick={() => {
            setFormData({ pickup_code: "", pickup_name: "" });
            setErrors({ pickup_code: "", pickup_name: "" });
            setOpenAdd(true);
          }}
        >
          Add New Pickup
        </Button>
      </div>

      <CommonTable
        data={pickups}
        onEdit={(row: Pickup) => {
          setSelectedRow(row);
          setFormData({
            pickup_code: row.pickup_code,
            pickup_name: row.pickup_name,
          });
          setErrors({ pickup_code: "", pickup_name: "" });
          setOpenEdit(true);
        }}
        onDelete={(row: Pickup) => {
          setSelectedRow(row);
          setOpenDelete(true);
        }}
      />

      {/* Add Dialog */}
      <CustomDialog
        open={openAdd}
        title="Add New Pickup"
        onClose={() => setOpenAdd(false)}
        onSubmit={handleAddSubmit}
        submitText="Save Pickup"
      >
        <div className="flex flex-col gap-4 mt-2">
          <TextField
            label="Pickup Code"
            name="pickup_code"
            value={formData.pickup_code}
            onChange={(e) =>
              setFormData({ ...formData, pickup_code: e.target.value })
            }
            error={!!errors.pickup_code}
            helperText={errors.pickup_code}
            fullWidth
          />
          <TextField
            label="Pickup Name"
            name="pickup_name"
            value={formData.pickup_name}
            onChange={(e) =>
              setFormData({ ...formData, pickup_name: e.target.value })
            }
            error={!!errors.pickup_name}
            helperText={errors.pickup_name}
            fullWidth
          />
        </div>
      </CustomDialog>

      {/* Edit Dialog */}
      <CustomDialog
        open={openEdit}
        title="Edit Pickup"
        onClose={() => setOpenEdit(false)}
        onSubmit={handleEditSubmit}
        submitText="Update Pickup"
      >
        <div className="flex flex-col gap-4 mt-2">
          <TextField
            label="Pickup Code"
            name="pickup_code"
            value={formData.pickup_code}
            onChange={(e) =>
              setFormData({ ...formData, pickup_code: e.target.value })
            }
            error={!!errors.pickup_code}
            helperText={errors.pickup_code}
            fullWidth
          />
          <TextField
            label="Pickup Name"
            name="pickup_name"
            value={formData.pickup_name}
            onChange={(e) =>
              setFormData({ ...formData, pickup_name: e.target.value })
            }
            error={!!errors.pickup_name}
            helperText={errors.pickup_name}
            fullWidth
          />
        </div>
      </CustomDialog>

      {/* Delete Dialog */}
      <CustomDialog
        open={openDelete}
        title="Confirm Delete"
        onClose={() => setOpenDelete(false)}
        onSubmit={handleDeleteSubmit}
        submitText="Delete"
      >
        <p>Are you sure you want to delete this pickup?</p>
      </CustomDialog>
    </div>
  );
}
