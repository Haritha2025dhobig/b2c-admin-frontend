"use client";

import React, { useEffect, useState } from "react";
import CommonTable from "@/components/Table";
import CustomDialog from "@/components/Dialog";
import { TextField } from "@mui/material";
import axios from "axios";
import { BASE_URL } from "@/utils/api";
import { Button } from "@/components/ui/button";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    lat: "",
    long: "",
    house_no: "",
    street: "",
    area: "",
    city: "",
    state: "",
    country: "",
    pin_code: "",
  });

  const [errors, setErrors] = useState({
    lat: "",
    long: "",
    house_no: "",
    street: "",
    area: "",
    city: "",
    state: "",
    country: "",
    pin_code: "",
  });

  // Validation
  const validate = () => {
    let tempErrors = { ...errors };
    let isValid = true;

    Object.keys(formData).forEach((key) => {
      if (!formData[key as keyof typeof formData]) {
        tempErrors[key as keyof typeof tempErrors] = "Required";
        isValid = false;
      } else {
        tempErrors[key as keyof typeof tempErrors] = "";
      }
    });

    setErrors(tempErrors);
    return isValid;
  };

  // Fetch Addresses
  const fetchAddresses = async () => {
    try {
      const response = await axios.get(`${BASE_URL}addresses/`);
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
      setAddresses(data);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  const didFetch = React.useRef(false);
  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    fetchAddresses();
  }, []);

  // Add Address
  const handleAddSubmit = async () => {
    if (!validate()) return;

    try {
      await axios.post(`${BASE_URL}addresses/`, formData);
      setOpenAdd(false);
      setFormData({
        lat: "",
        long: "",
        house_no: "",
        street: "",
        area: "",
        city: "",
        state: "",
        country: "",
        pin_code: "",
      });
     setErrors({
  lat: "",
  long: "",
  house_no: "",
  street: "",
  area: "",
  city: "",
  state: "",
  country: "",
  pin_code: "",
});

      fetchAddresses();
    } catch (error) {
      console.error("Error adding address:", error);
    }
  };

  // Edit Address
  const handleEditSubmit = async () => {
    if (!selectedRow) return;
    if (!validate()) return;

    try {
      await axios.patch(`${BASE_URL}addresses/${selectedRow.id}/`, formData);
      setOpenEdit(false);
      setErrors({
  lat: "",
  long: "",
  house_no: "",
  street: "",
  area: "",
  city: "",
  state: "",
  country: "",
  pin_code: "",
});
      fetchAddresses();
    } catch (error) {
      console.error("Error editing address:", error);
    }
  };

  // Delete Address
  const handleDeleteSubmit = async () => {
    if (!selectedRow) return;

    try {
      await axios.delete(`${BASE_URL}addresses/${selectedRow.id}/`);
      setOpenDelete(false);
      fetchAddresses();
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Addresses</h1>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
          onClick={() => {
            setFormData({
              lat: "",
              long: "",
              house_no: "",
              street: "",
              area: "",
              city: "",
              state: "",
              country: "",
              pin_code: "",
            });
            setErrors({
              lat: "",
              long: "",
              house_no: "",
              street: "",
              area: "",
              city: "",
              state: "",
              country: "",
              pin_code: "",
            });
            setOpenAdd(true);
          }}
        >
          Add New Address
        </Button>
      </div>

      {/* Table */}
      <CommonTable
        data={addresses}
        onEdit={(row) => {
          setSelectedRow(row);
          setFormData({
            lat: row.lat,
            long: row.long,
            house_no: row.house_no,
            street: row.street,
            area: row.area,
            city: row.city,
            state: row.state,
            country: row.country,
            pin_code: row.pin_code,
          });
          setErrors({
            lat: "",
            long: "",
            house_no: "",
            street: "",
            area: "",
            city: "",
            state: "",
            country: "",
            pin_code: "",
          });
          setOpenEdit(true);
        }}
        onDelete={(row) => {
          setSelectedRow(row);
          setOpenDelete(true);
        }}
      />

      {/* Add Dialog */}
      <CustomDialog
        open={openAdd}
        title="Add New Address"
        onClose={() => setOpenAdd(false)}
        onSubmit={handleAddSubmit}
        submitText="Save Address"
      >
        <div className="flex flex-col gap-4 mt-2">
          {Object.keys(formData).map((key) => (
            <TextField
              key={key}
              label={key.replace("_", " ").toUpperCase()}
              value={formData[key as keyof typeof formData]}
              onChange={(e) =>
                setFormData({ ...formData, [key]: e.target.value })
              }
              error={!!errors[key as keyof typeof errors]}
              helperText={errors[key as keyof typeof errors]}
              fullWidth
            />
          ))}
        </div>
      </CustomDialog>

      {/* Edit Dialog */}
      <CustomDialog
        open={openEdit}
        title="Edit Address"
        onClose={() => setOpenEdit(false)}
        onSubmit={handleEditSubmit}
        submitText="Update Address"
      >
        <div className="flex flex-col gap-4 mt-2">
          {Object.keys(formData).map((key) => (
            <TextField
              key={key}
              label={key.replace("_", " ").toUpperCase()}
              value={formData[key as keyof typeof formData]}
              onChange={(e) =>
                setFormData({ ...formData, [key]: e.target.value })
              }
              error={!!errors[key as keyof typeof errors]}
              helperText={errors[key as keyof typeof errors]}
              fullWidth
            />
          ))}
        </div>
      </CustomDialog>

      {/* Delete Confirmation */}
      <CustomDialog
        open={openDelete}
        title="Confirm Delete"
        onClose={() => setOpenDelete(false)}
        onSubmit={handleDeleteSubmit}
        submitText="Delete"
        cancelText="Cancel"
      >
        <p>Are you sure you want to delete this address?</p>
      </CustomDialog>
    </div>
  );
}
