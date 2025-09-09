"use client";

import React, { useEffect, useState, useRef } from "react";
import CommonTable from "@/components/Table";
import CustomDialog from "@/components/Dialog";
import { TextField, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import axios from "axios";
import { BASE_URL } from "@/utils/api";
import { Button } from "@/components/ui/button";

interface ServiceDeliveryCode {
  id: number;
  laundry: number | null;
  service: number | null;
  service_period: number | null;
  price_type: number | null;
  opening_time: string | null;
  closing_time: string | null;
  min_quantity: number | null;
  turnaround_time: number | null;
  service_period_price: number | null;
  service_price: number | null;
  pickup_delivery_cost: number | null;
}

// Reference data
interface Laundry { id: number; name: string }
interface Service { id: number; service_name: string }
interface ServicePeriod { id: number; service_period_name: string }
interface PriceType { id: number; price_type_name: string }

export default function ServiceDeliveryCodePage() {
  const [codes, setCodes] = useState<ServiceDeliveryCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedRow, setSelectedRow] = useState<ServiceDeliveryCode | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Reference data
  const [laundries, setLaundries] = useState<Laundry[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [periods, setPeriods] = useState<ServicePeriod[]>([]);
  const [priceTypes, setPriceTypes] = useState<PriceType[]>([]);

  // Form state
  const [formData, setFormData] = useState<ServiceDeliveryCode>({
    id: 0,
    laundry: null,
    service: null,
    service_period: null,
    price_type: null,
    opening_time: "",
    closing_time: "",
    min_quantity: null,
    turnaround_time: null,
    service_period_price: null,
    service_price: null,
    pickup_delivery_cost: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ Validation
  const validate = () => {
    const temp: Record<string, string> = {};
    let isValid = true;

    const requiredFields = ["laundry", "service", "service_period", "price_type"];
    requiredFields.forEach((k) => {
      if (!(formData as any)[k]) {
        temp[k] = `${k.replaceAll("_", " ")} is required`;
        isValid = false;
      }
    });

    if (formData.opening_time && !/^\d{2}:\d{2}:\d{2}$/.test(formData.opening_time)) {
      temp.opening_time = "Opening time must be in HH:MM:SS format";
      isValid = false;
    }
    if (formData.closing_time && !/^\d{2}:\d{2}:\d{2}$/.test(formData.closing_time)) {
      temp.closing_time = "Closing time must be in HH:MM:SS format";
      isValid = false;
    }

    ["min_quantity", "turnaround_time", "service_period_price", "service_price", "pickup_delivery_cost"].forEach((k) => {
      const val = (formData as any)[k];
      if (val != null && val < 0) {
        temp[k] = `${k.replaceAll("_", " ")} must be a number ≥ 0`;
        isValid = false;
      }
    });

    setErrors(temp);
    return isValid;
  };

  // ✅ Fetch service delivery codes
  const fetchCodes = async (authToken: string | null) => {
    if (!authToken) return;
    try {
      const response = await axios.get<ServiceDeliveryCode[] | { results: ServiceDeliveryCode[] }>(
        `${BASE_URL}service-delivery-codes/`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      setCodes(data);
    } catch (error) {
      console.error("Error fetching service delivery codes:", error);
      setCodes([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch reference data
  // const fetchReferenceData = async (authToken: string) => {
  //   try {
  //     const [l, s, p, t] = await Promise.all([
  //       axios.get<Laundry[]>(`${BASE_URL}laundries/`, { headers: { Authorization: `Bearer ${authToken}` } }),
  //       axios.get<Service[]>(`${BASE_URL}services/`, { headers: { Authorization: `Bearer ${authToken}` } }),
  //       axios.get<ServicePeriod[]>(`${BASE_URL}service-periods/`, { headers: { Authorization: `Bearer ${authToken}` } }),
  //       axios.get<PriceType[]>(`${BASE_URL}price-types/`, { headers: { Authorization: `Bearer ${authToken}` } }),
  //     ]);
  //     setLaundries(Array.isArray(l.data) ? l.data : (l.data as any).results || []);
  //     setServices(Array.isArray(s.data) ? s.data : (s.data as any).results || []);
  //     setPeriods(Array.isArray(p.data) ? p.data : (p.data as any).results || []);
  //     setPriceTypes(Array.isArray(t.data) ? t.data : (t.data as any).results || []);
  //   } catch (err) {
  //     console.error("Error fetching reference data:", err);
  //   }
  // };

  // ✅ Fetch on mount
  const didFetch = useRef(false);
  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    const storedToken = localStorage.getItem("access_token");
    setToken(storedToken);
    if (storedToken) {
      fetchCodes(storedToken);
      // fetchReferenceData(storedToken);
    }
  }, []);

  // ✅ Add
  const handleAddSubmit = async () => {
    if (!validate() || !token) return;
    try {
      await axios.post(`${BASE_URL}service-delivery-codes/`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOpenAdd(false);
      fetchCodes(token);
    } catch (error) {
      console.error("Error adding service delivery code:", error);
    }
  };

  // ✅ Edit
  const handleEditSubmit = async () => {
    if (!selectedRow || !validate() || !token) return;
    try {
      await axios.patch(
        `${BASE_URL}service-delivery-codes/${selectedRow.id}/`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOpenEdit(false);
      fetchCodes(token);
    } catch (error) {
      console.error("Error editing service delivery code:", error);
    }
  };

  // ✅ Delete
  const handleDeleteSubmit = async () => {
    if (!selectedRow || !token) return;
    try {
      await axios.delete(`${BASE_URL}service-delivery-codes/${selectedRow.id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOpenDelete(false);
      fetchCodes(token);
    } catch (error) {
      console.error("Error deleting service delivery code:", error);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Service Delivery Codes</h1>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
          onClick={() => {
            setFormData({
              id: 0,
              laundry: null,
              service: null,
              service_period: null,
              price_type: null,
              opening_time: "",
              closing_time: "",
              min_quantity: null,
              turnaround_time: null,
              service_period_price: null,
              service_price: null,
              pickup_delivery_cost: null,
            });
            setErrors({});
            setOpenAdd(true);
          }}
        >
          Add Service Delivery Code
        </Button>
      </div>

      <CommonTable
        data={codes}
        onEdit={(row: ServiceDeliveryCode) => {
          setSelectedRow(row);
          setFormData(row);
          setErrors({});
          setOpenEdit(true);
        }}
        onDelete={(row: ServiceDeliveryCode) => {
          setSelectedRow(row);
          setOpenDelete(true);
        }}
      />

      <CustomDialog
        open={openAdd}
        title="Add Service Delivery Code"
        onClose={() => setOpenAdd(false)}
        onSubmit={handleAddSubmit}
        submitText="Save"
      >
        <FormFields
          formData={formData}
          errors={errors}
          setFormData={setFormData}
          laundries={laundries}
          services={services}
          periods={periods}
          priceTypes={priceTypes}
        />
      </CustomDialog>

      <CustomDialog
        open={openEdit}
        title="Edit Service Delivery Code"
        onClose={() => setOpenEdit(false)}
        onSubmit={handleEditSubmit}
        submitText="Update"
      >
        <FormFields
          formData={formData}
          errors={errors}
          setFormData={setFormData}
          laundries={laundries}
          services={services}
          periods={periods}
          priceTypes={priceTypes}
        />
      </CustomDialog>

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

// ✅ Form fields
function FormFields({
  formData,
  errors,
  setFormData,
  laundries,
  services,
  periods,
  priceTypes,
}: {
  formData: ServiceDeliveryCode;
  errors: Record<string, string>;
  setFormData: React.Dispatch<React.SetStateAction<ServiceDeliveryCode>>;
  laundries: Laundry[];
  services: Service[];
  periods: ServicePeriod[];
  priceTypes: PriceType[];
}) {
  return (
    <div className="flex flex-col gap-4 mt-2">
      <FormControl fullWidth>
        <InputLabel>Laundry</InputLabel>
        <Select
          value={formData.laundry || ""}
          onChange={(e) => setFormData({ ...formData, laundry: Number(e.target.value) })}
        >
          {laundries.map((l) => (
            <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>
          ))}
        </Select>
        {errors.laundry && <p className="text-red-500 text-sm">{errors.laundry}</p>}
      </FormControl>

      <FormControl fullWidth>
        <InputLabel>Service</InputLabel>
        <Select
          value={formData.service || ""}
          onChange={(e) => setFormData({ ...formData, service: Number(e.target.value) })}
        >
          {services.map((s) => (
            <MenuItem key={s.id} value={s.id}>{s.service_name}</MenuItem>
          ))}
        </Select>
        {errors.service && <p className="text-red-500 text-sm">{errors.service}</p>}
      </FormControl>

      <FormControl fullWidth>
        <InputLabel>Service Period</InputLabel>
        <Select
          value={formData.service_period || ""}
          onChange={(e) => setFormData({ ...formData, service_period: Number(e.target.value) })}
        >
          {periods.map((p) => (
            <MenuItem key={p.id} value={p.id}>{p.service_period_name}</MenuItem>
          ))}
        </Select>
        {errors.service_period && <p className="text-red-500 text-sm">{errors.service_period}</p>}
      </FormControl>

      <FormControl fullWidth>
        <InputLabel>Price Type</InputLabel>
        <Select
          value={formData.price_type || ""}
          onChange={(e) => setFormData({ ...formData, price_type: Number(e.target.value) })}
        >
          {priceTypes.map((p) => (
            <MenuItem key={p.id} value={p.id}>{p.price_type_name}</MenuItem>
          ))}
        </Select>
        {errors.price_type && <p className="text-red-500 text-sm">{errors.price_type}</p>}
      </FormControl>

      <TextField
        label="Opening Time (HH:MM:SS)"
        value={formData.opening_time || ""}
        onChange={(e) => setFormData({ ...formData, opening_time: e.target.value })}
        error={!!errors.opening_time}
        helperText={errors.opening_time}
        fullWidth
      />
      <TextField
        label="Closing Time (HH:MM:SS)"
        value={formData.closing_time || ""}
        onChange={(e) => setFormData({ ...formData, closing_time: e.target.value })}
        error={!!errors.closing_time}
        helperText={errors.closing_time}
        fullWidth
      />
      <TextField
        label="Min Quantity"
        type="number"
        value={formData.min_quantity || ""}
        onChange={(e) => setFormData({ ...formData, min_quantity: Number(e.target.value) })}
        error={!!errors.min_quantity}
        helperText={errors.min_quantity}
        fullWidth
      />
      <TextField
        label="Turnaround Time (hours)"
        type="number"
        value={formData.turnaround_time || ""}
        onChange={(e) => setFormData({ ...formData, turnaround_time: Number(e.target.value) })}
        error={!!errors.turnaround_time}
        helperText={errors.turnaround_time}
        fullWidth
      />
      <TextField
        label="Service Period Price"
        type="number"
        value={formData.service_period_price || ""}
        onChange={(e) => setFormData({ ...formData, service_period_price: Number(e.target.value) })}
        error={!!errors.service_period_price}
        helperText={errors.service_period_price}
        fullWidth
      />
      <TextField
        label="Service Price"
        type="number"
        value={formData.service_price || ""}
        onChange={(e) => setFormData({ ...formData, service_price: Number(e.target.value) })}
        error={!!errors.service_price}
        helperText={errors.service_price}
        fullWidth
      />
      <TextField
        label="Pickup Delivery Cost"
        type="number"
        value={formData.pickup_delivery_cost || ""}
        onChange={(e) => setFormData({ ...formData, pickup_delivery_cost: Number(e.target.value) })}
        error={!!errors.pickup_delivery_cost}
        helperText={errors.pickup_delivery_cost}
        fullWidth
      />
    </div>
  );
}
