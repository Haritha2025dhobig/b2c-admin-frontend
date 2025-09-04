"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import CommonTable from "@/components/Table";
import CustomDialog from "@/components/Dialog";
import { TextField } from "@mui/material";
import axios from "axios";
import { BASE_URL } from "@/utils/api";
import { Button } from "@/components/ui/button";

// Types
interface Address {
  id: number;
  lat: string;
  long: string;
  house_no: string;
  street: string;
  area: string;
  city: string;
  state: string;
  country: string;
  pin_code: string;
}

type FormData = Omit<Address, "id">;

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [selectedRow, setSelectedRow] = useState<Address | null>(null);

  const [formData, setFormData] = useState<FormData>({
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

  const [errors, setErrors] = useState<FormData>({
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

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  // ✅ Validation
  const validate = () => {
    const tempErrors: FormData = { ...errors };
    let isValid = true;

    (Object.keys(formData) as (keyof FormData)[]).forEach((key) => {
      if (!formData[key]) {
        tempErrors[key] = "Required";
        isValid = false;
      } else {
        tempErrors[key] = "";
      }
    });

    setErrors(tempErrors);
    return isValid;
  };

  // ✅ Fetch Addresses
  const fetchAddresses = useCallback(async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${BASE_URL}addresses/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: Address[] = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
      setAddresses(data);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const didFetch = useRef(false);
  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    fetchAddresses();
  }, [fetchAddresses]);

  // ✅ Add Address
  const handleAddSubmit = async () => {
    if (!validate() || !token) return;

    try {
      await axios.post(`${BASE_URL}addresses/`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOpenAdd(false);
      resetForm();
      fetchAddresses();
    } catch (error) {
      console.error("Error adding address:", error);
    }
  };

  // ✅ Edit Address
  const handleEditSubmit = async () => {
    if (!selectedRow || !validate() || !token) return;

    try {
      await axios.patch(`${BASE_URL}addresses/${selectedRow.id}/`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOpenEdit(false);
      resetErrors();
      fetchAddresses();
    } catch (error) {
      console.error("Error editing address:", error);
    }
  };

  // ✅ Delete Address
  const handleDeleteSubmit = async () => {
    if (!selectedRow || !token) return;

    try {
      await axios.delete(`${BASE_URL}addresses/${selectedRow.id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOpenDelete(false);
      fetchAddresses();
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  const resetForm = () => {
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
    resetErrors();
  };

  const resetErrors = () => {
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
            resetForm();
            setOpenAdd(true);
          }}
        >
          Add New Address
        </Button>
      </div>

      {/* Table */}
      <CommonTable
        data={addresses}
        onEdit={(row: Address) => {
          setSelectedRow(row);
          setFormData({ ...row });
          resetErrors();
          setOpenEdit(true);
        }}
        onDelete={(row: Address) => {
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
          {(Object.keys(formData) as (keyof FormData)[]).map((key) => (
            <TextField
              key={key}
              label={key.replace("_", " ").toUpperCase()}
              value={formData[key]}
              onChange={(e) =>
                setFormData({ ...formData, [key]: e.target.value })
              }
              error={!!errors[key]}
              helperText={errors[key]}
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
          {(Object.keys(formData) as (keyof FormData)[]).map((key) => (
            <TextField
              key={key}
              label={key.replace("_", " ").toUpperCase()}
              value={formData[key]}
              onChange={(e) =>
                setFormData({ ...formData, [key]: e.target.value })
              }
              error={!!errors[key]}
              helperText={errors[key]}
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
