"use client";

import React, { useEffect, useState, useCallback } from "react";
import CommonTable from "@/components/Table";
import CustomDialog from "@/components/Dialog";
import { TextField } from "@mui/material";
import axios from "axios";
import { BASE_URL } from "@/utils/api";
import { Button } from "@/components/ui/button";

// ✅ Define proper type for PriceType
export interface PriceType {
  id: number;
  price_type_name: string;
}

export default function PriceTypePage() {
  const [priceTypes, setPriceTypes] = useState<PriceType[]>([]);
  const [loading, setLoading] = useState(true);

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [selectedRow, setSelectedRow] = useState<PriceType | null>(null);

  const [formData, setFormData] = useState({
    price_type_name: "",
  });

  const [errors, setErrors] = useState({
    price_type_name: "",
  });

  // 🔑 Get token from localStorage
  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("access_token");
    }
    return null;
  };

  const validate = () => {
    const tempErrors = { price_type_name: "" }; // ✅ const instead of let
    let isValid = true;

    if (!formData.price_type_name) {
      tempErrors.price_type_name = "Price Type Name is required";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  // ✅ useCallback so we can safely use it in useEffect dependencies
  const fetchPriceTypes = useCallback(async () => {
    try {
      const token = getToken();
      const response = await axios.get<PriceType[] | { results: PriceType[] }>(
        `${BASE_URL}price-types/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
      setPriceTypes(data);
    } catch (error) {
      console.error("Error fetching price types:", error);
      setPriceTypes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPriceTypes();
  }, [fetchPriceTypes]);

  const handleAddSubmit = async () => {
    if (!validate()) return;
    try {
      const token = getToken();
      await axios.post(`${BASE_URL}price-types/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOpenAdd(false);
      setFormData({ price_type_name: "" });
      setErrors({ price_type_name: "" });
      fetchPriceTypes();
    } catch (error) {
      console.error("Error adding price type:", error);
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedRow) return;
    if (!validate()) return;
    try {
      const token = getToken();
      await axios.patch(
        `${BASE_URL}price-types/${selectedRow.id}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setOpenEdit(false);
      setErrors({ price_type_name: "" });
      fetchPriceTypes();
    } catch (error) {
      console.error("Error editing price type:", error);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedRow) return;
    try {
      const token = getToken();
      await axios.delete(`${BASE_URL}price-types/${selectedRow.id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOpenDelete(false);
      fetchPriceTypes();
    } catch (error) {
      console.error("Error deleting price type:", error);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        {/* <h1 className="text-xl font-semibold">Price Types</h1> */}
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white mt-3 ml-3"
          size="lg"
          onClick={() => {
            setFormData({ price_type_name: "" });
            setErrors({ price_type_name: "" });
            setOpenAdd(true);
          }}
        >
          Add New Price Type
        </Button>
      </div>

      <CommonTable
        data={priceTypes}
        onEdit={(row) => {
          setSelectedRow(row);
          setFormData({ price_type_name: row.price_type_name });
          setErrors({ price_type_name: "" });
          setOpenEdit(true);
        }}
        onDelete={(row) => {
          setSelectedRow(row);
          setOpenDelete(true);
        }}
      />

      <CustomDialog
        open={openAdd}
        title="Add New Price Type"
        onClose={() => setOpenAdd(false)}
        onSubmit={handleAddSubmit}
        submitText="Save Price Type"
      >
        <TextField
          label="Price Type Name"
          name="price_type_name"
          value={formData.price_type_name}
          onChange={(e) =>
            setFormData({ ...formData, price_type_name: e.target.value })
          }
          error={!!errors.price_type_name}
          helperText={errors.price_type_name}
          fullWidth
        />
      </CustomDialog>

      <CustomDialog
        open={openEdit}
        title="Edit Price Type"
        onClose={() => setOpenEdit(false)}
        onSubmit={handleEditSubmit}
        submitText="Update Price Type"
      >
        <TextField
          label="Price Type Name"
          name="price_type_name"
          value={formData.price_type_name}
          onChange={(e) =>
            setFormData({ ...formData, price_type_name: e.target.value })
          }
          error={!!errors.price_type_name}
          helperText={errors.price_type_name}
          fullWidth
        />
      </CustomDialog>

      <CustomDialog
        open={openDelete}
        title="Confirm Delete"
        onClose={() => setOpenDelete(false)}
        onSubmit={handleDeleteSubmit}
        submitText="Delete"
      >
        <p>Are you sure you want to delete this price type?</p>
      </CustomDialog>
    </div>
  );
}
