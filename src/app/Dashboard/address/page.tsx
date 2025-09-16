"use client";

import React, { useEffect, useState, useCallback } from "react";
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
  const [errorText, setErrorText] = useState<string>("");

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

  // ---------- helpers ----------
  const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token"); // <-- make sure this is the key you use elsewhere
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const validate = () => {
    const temp: FormData = { ...errors };
    let ok = true;
    (Object.keys(formData) as (keyof FormData)[]).forEach((k) => {
      if (!formData[k]) {
        temp[k] = "Required";
        ok = false;
      } else {
        temp[k] = "";
      }
    });
    setErrors(temp);
    return ok;
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

  // ---------- fetch (robust) ----------
  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    setErrorText("");

    const headers = getAuthHeaders();
    const endpoints = ["addresses/", "user-address/"]; // try both; first that works wins

    try {
      for (const path of endpoints) {
        try {
          const res = await axios.get(`${BASE_URL}${path}`, { headers });
          const data: Address[] = Array.isArray(res.data)
            ? res.data
            : res.data?.results || [];

          if (Array.isArray(data)) {
            setAddresses(data);
            setLoading(false);
            return; // success
          }
        } catch (err) {
          // continue to next endpoint
        }
      }
      // if both failed:
      setAddresses([]);
      setErrorText("Couldn’t load addresses. Check your API path or auth.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // ---------- CRUD ----------
  const handleAddSubmit = async () => {
    if (!validate()) return;
    try {
      await axios.post(`${BASE_URL}addresses/`, formData, { headers: getAuthHeaders() });
      setOpenAdd(false);
      resetForm();
      fetchAddresses();
    } catch (error) {
      // fallback to user-address/ if needed
      try {
        await axios.post(`${BASE_URL}user-address/`, formData, { headers: getAuthHeaders() });
        setOpenAdd(false);
        resetForm();
        fetchAddresses();
      } catch (e) {
        console.error("Error adding address:", e);
        setErrorText("Failed to add address.");
      }
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedRow || !validate()) return;
    const id = selectedRow.id;
    try {
      await axios.patch(`${BASE_URL}addresses/${id}/`, formData, { headers: getAuthHeaders() });
      setOpenEdit(false);
      fetchAddresses();
    } catch {
      try {
        await axios.patch(`${BASE_URL}user-address/${id}/`, formData, { headers: getAuthHeaders() });
        setOpenEdit(false);
        fetchAddresses();
      } catch (e) {
        console.error("Error editing address:", e);
        setErrorText("Failed to update address.");
      }
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedRow) return;
    const id = selectedRow.id;
    try {
      await axios.delete(`${BASE_URL}addresses/${id}/`, { headers: getAuthHeaders() });
      setOpenDelete(false);
      fetchAddresses();
    } catch {
      try {
        await axios.delete(`${BASE_URL}user-address/${id}/`, { headers: getAuthHeaders() });
        setOpenDelete(false);
        fetchAddresses();
      } catch (e) {
        console.error("Error deleting address:", e);
        setErrorText("Failed to delete address.");
      }
    }
  };

  // ---------- render ----------
  if (loading) return <p>Loading...</p>;

  if (errorText) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold">Addresses</h1>
        <p className="text-sm text-red-600">{errorText}</p>
        <Button variant="outline" onClick={fetchAddresses}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex  justify-end">
        {/* <h1 className="text-xl font-semibold">Addresses</h1> */}
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white mt-3 ml-3"
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
          const { id, ...rest } = row;
          setFormData(rest);
          setOpenEdit(true);
        }}
        onDelete={(row: Address) => {
          setSelectedRow(row);
          setOpenDelete(true);
        }}
        columns={[
          { key: "id" },
          { key: "lat" },
          { key: "long" },
          { key: "house_no", header: "HOUSE NO" },
          { key: "street" },
          { key: "area" },
          { key: "city" },
          { key: "state" },
          { key: "country" },
          { key: "pin_code", header: "PIN CODE" },
        ]}
        fitColumnsToContent
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
              onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
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
