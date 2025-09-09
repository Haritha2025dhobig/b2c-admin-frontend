"use client";

import React, { useCallback, useEffect, useRef, useState, Suspense } from "react";
import CommonTable from "@/components/Table";
import CustomDialog from "@/components/Dialog";
import { TextField, MenuItem } from "@mui/material";
import axios from "axios";
import { BASE_URL } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";

type CodeRow = {
  id?: number;
  laundry?: number | null;
  service?: number | string;
  service_period?: number | string;
  price_type?: number | string;
  opening_time?: string;
  closing_time?: string;
  min_quantity?: number | string;
  turnaround_time?: number | string; // hours only
  service_period_price?: number | string;
  service_price?: number | string;
  pickup_delivery_cost?: number | string;
};

type Option = { id: number; label: string };

type ServiceApi = { id: number; service_name?: string | null };
type ServicePeriodApi = { id: number; service_period_name?: string | null };
type PriceTypeApi = { id: number; price_type_name?: string | null };
type Paginated<T> = { results?: T[] };

const clamp = (n: number, min: number, max: number) =>
  isNaN(n) ? min : Math.min(max, Math.max(min, n));

const formatHMSInput = (raw: string): string => {
  const digits = raw.replace(/\D/g, "").slice(0, 6);
  if (!digits) return "";
  const h = digits.slice(0, 2);
  const m = digits.slice(2, 4);
  const s = digits.slice(4, 6);
  const hh = String(clamp(parseInt(h || "0", 10), 0, 23)).padStart(2, "0");
  const mm = String(clamp(parseInt(m || "0", 10), 0, 59)).padStart(2, "0");
  const ss = String(clamp(parseInt(s || "0", 10), 0, 59)).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
};

const normalizeToHMS = (val: string): string => {
  if (!val) return "";
  const parts = val.split(":");
  if (parts.length === 2) {
    const [H, M] = parts;
    const hh = String(clamp(parseInt(H || "0", 10), 0, 23)).padStart(2, "0");
    const mm = String(clamp(parseInt(M || "0", 10), 0, 59)).padStart(2, "0");
    return `${hh}:${mm}:00`;
  }
  if (parts.length === 3) {
    const [H, M, S] = parts;
    const hh = String(clamp(parseInt(H || "0", 10), 0, 23)).padStart(2, "0");
    const mm = String(clamp(parseInt(M || "0", 10), 0, 59)).padStart(2, "0");
    const ss = String(clamp(parseInt(S || "0", 10), 0, 59)).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  }
  return formatHMSInput(val);
};

const onlyInteger = (raw: string) => raw.replace(/\D/g, "");
const onlyDecimal = (raw: string) => {
  let v = raw.replace(/[^0-9.]/g, "");
  v = v.replace(/(\..*)\./g, "$1");
  return v;
};

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;

function toArray<T>(resData: T[] | Paginated<T>): T[] {
  return Array.isArray(resData) ? resData : resData.results ?? [];
}

// Local form state
type FormState = {
  service: string | number;
  service_period: string | number;
  price_type: string | number;
  opening_time: string;
  closing_time: string;
  min_quantity: string | number;
  turnaround_time: string | number;
  service_period_price: string | number;
  service_price: string | number;
  pickup_delivery_cost: string | number;
};

/** ---- TOP-LEVEL PAGE WRAPPER (NO useSearchParams HERE) ---- */
export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ServiceDeliveryCodesPageInner />
    </Suspense>
  );
}

/** ---- INNER COMPONENT THAT USES useSearchParams ---- */
function ServiceDeliveryCodesPageInner() {
  const searchParams = useSearchParams();
  const laundryId = searchParams.get("laundry_id");

  const [codes, setCodes] = useState<CodeRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [selectedRow, setSelectedRow] = useState<CodeRow | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [services, setServices] = useState<Option[]>([]);
  const [servicePeriods, setServicePeriods] = useState<Option[]>([]);
  const [priceTypes, setPriceTypes] = useState<Option[]>([]);
  const [refLoading, setRefLoading] = useState(false);

  const [formData, setFormData] = useState<FormState>({
    service: "",
    service_period: "",
    price_type: "",
    opening_time: "",
    closing_time: "",
    min_quantity: "",
    turnaround_time: "",
    service_period_price: "",
    service_price: "",
    pickup_delivery_cost: "",
  });

  const [errors, setErrors] = useState<Record<keyof FormState, string>>({
    service: "",
    service_period: "",
    price_type: "",
    opening_time: "",
    closing_time: "",
    min_quantity: "",
    turnaround_time: "",
    service_period_price: "",
    service_price: "",
    pickup_delivery_cost: "",
  });

  const validate = () => {
    const temp: Record<keyof FormState, string> = { ...errors };
    let ok = true;

    (Object.keys(formData) as (keyof FormState)[]).forEach((k) => {
      if (!formData[k] && formData[k] !== 0) {
        temp[k] = `${k.replaceAll("_", " ")} is required`;
        ok = false;
      } else temp[k] = "";
    });

    (["opening_time", "closing_time"] as const).forEach((k) => {
      if (formData[k] && !timeRegex.test(String(formData[k]))) {
        temp[k] = `${k.replaceAll("_", " ")} must be in HH:MM:SS format`;
        ok = false;
      }
    });

    const nTurn = Number(formData.turnaround_time);
    if (isNaN(nTurn) || nTurn < 1 || !Number.isInteger(nTurn)) {
      temp.turnaround_time = "Turnaround time must be an integer ≥ 1";
      ok = false;
    }

    const nMin = Number(formData.min_quantity);
    if (isNaN(nMin) || nMin < 1 || !Number.isInteger(nMin)) {
      temp.min_quantity = "Minimum quantity must be an integer ≥ 1";
      ok = false;
    }

    (["service_period_price", "service_price", "pickup_delivery_cost"] as const).forEach((k) => {
      const n = Number(formData[k]);
      if (isNaN(n) || n < 0) {
        temp[k] = `${k.replaceAll("_", " ")} must be a number ≥ 0`;
        ok = false;
      }
    });

    setErrors(temp);
    return ok;
  };

  const fetchCodes = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const url = laundryId
        ? `${BASE_URL}service-delivery-codes/?laundry_id=${encodeURIComponent(laundryId)}`
        : `${BASE_URL}service-delivery-codes/`;
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setCodes(toArray<CodeRow>(res.data as CodeRow[] | Paginated<CodeRow>));
    } catch (err) {
      console.error(err);
      setCodes([]);
    } finally {
      setLoading(false);
    }
  }, [token, laundryId]);

  const fetchReferenceData = useCallback(async () => {
    if (!token) return;
    setRefLoading(true);
    try {
      const [svcRes, spRes, ptRes] = await Promise.all([
        axios.get(`${BASE_URL}services/`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${BASE_URL}service-periods/`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${BASE_URL}price-types/`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const svc = toArray<ServiceApi>(svcRes.data as ServiceApi[] | Paginated<ServiceApi>);
      const sPeriods = toArray<ServicePeriodApi>(spRes.data as ServicePeriodApi[] | Paginated<ServicePeriodApi>);
      const pTypes = toArray<PriceTypeApi>(ptRes.data as PriceTypeApi[] | Paginated<PriceTypeApi>);

      setServices(svc.map((s) => ({ id: s.id, label: s.service_name ?? `#${s.id}` })));
      setServicePeriods(sPeriods.map((p) => ({ id: p.id, label: p.service_period_name ?? `#${p.id}` })));
      setPriceTypes(pTypes.map((p) => ({ id: p.id, label: p.price_type_name ?? `#${p.id}` })));
    } catch (e) {
      console.error(e);
      setServices([]);
      setServicePeriods([]);
      setPriceTypes([]);
    } finally {
      setRefLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");
    setToken(storedToken);
  }, []);

  const didFetch = useRef(false);
  useEffect(() => {
    if (token && !didFetch.current) {
      didFetch.current = true;
      fetchCodes();
    }
  }, [token, laundryId, fetchCodes]);

  const handleAddOpen = async () => {
    setFormData({
      service: "",
      service_period: "",
      price_type: "",
      opening_time: "",
      closing_time: "",
      min_quantity: "",
      turnaround_time: "",
      service_period_price: "",
      service_price: "",
      pickup_delivery_cost: "",
    });
    await fetchReferenceData();
    setOpenAdd(true);
  };

  const handleEditOpen = async (row: CodeRow) => {
    setSelectedRow(row);
    setFormData({
      service: String(row.service ?? ""),
      service_period: String(row.service_period ?? ""),
      price_type: String(row.price_type ?? ""),
      opening_time: String(row.opening_time ?? ""),
      closing_time: String(row.closing_time ?? ""),
      min_quantity: String(row.min_quantity ?? ""),
      turnaround_time: String(row.turnaround_time ?? ""),
      service_period_price: String(row.service_period_price ?? ""),
      service_price: String(row.service_price ?? ""),
      pickup_delivery_cost: String(row.pickup_delivery_cost ?? ""),
    });
    await fetchReferenceData();
    setOpenEdit(true);
  };

  const handleAddSubmit = async () => {
    if (!validate() || !token || !laundryId) return;
    try {
      const payload: CodeRow = {
        laundry: Number(laundryId),
        service: Number(formData.service),
        service_period: Number(formData.service_period),
        price_type: Number(formData.price_type),
        opening_time: normalizeToHMS(formData.opening_time),
        closing_time: normalizeToHMS(formData.closing_time),
        min_quantity: Number(formData.min_quantity),
        turnaround_time: Number(formData.turnaround_time),
        service_period_price: Number(formData.service_period_price),
        service_price: Number(formData.service_price),
        pickup_delivery_cost: Number(formData.pickup_delivery_cost),
      };
      await axios.post(`${BASE_URL}service-delivery-codes/`, payload, { headers: { Authorization: `Bearer ${token}` } });
      setOpenAdd(false);
      fetchCodes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedRow || !validate() || !token) return;
    try {
      const payload: Partial<CodeRow> = {
        ...(laundryId ? { laundry: Number(laundryId) } : {}),
        service: Number(formData.service),
        service_period: Number(formData.service_period),
        price_type: Number(formData.price_type),
        opening_time: normalizeToHMS(formData.opening_time),
        closing_time: normalizeToHMS(formData.closing_time),
        min_quantity: Number(formData.min_quantity),
        turnaround_time: Number(formData.turnaround_time),
        service_period_price: Number(formData.service_period_price),
        service_price: Number(formData.service_price),
        pickup_delivery_cost: Number(formData.pickup_delivery_cost),
      };
      await axios.patch(`${BASE_URL}service-delivery-codes/${selectedRow.id}/`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOpenEdit(false);
      fetchCodes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedRow || !token) return;
    try {
      await axios.delete(`${BASE_URL}service-delivery-codes/${selectedRow.id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOpenDelete(false);
      fetchCodes();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          Service Delivery Codes{laundryId ? ` — Laundry #${laundryId}` : ""}
        </h1>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white" size="lg" onClick={handleAddOpen}>
          Add New Code
        </Button>
      </div>

      <CommonTable
        data={codes}
        onEdit={handleEditOpen}
        onDelete={(row) => {
          setSelectedRow(row);
          setOpenDelete(true);
        }}
      />

      <CustomDialog
        open={openAdd}
        title="Add New Code"
        onClose={() => setOpenAdd(false)}
        onSubmit={handleAddSubmit}
        submitText="Save"
        disabled={refLoading}
      >
        <FormFields
          formData={formData}
          errors={errors}
          onChange={(k, v) => setFormData((s) => ({ ...s, [k]: v }))}
          services={services}
          servicePeriods={servicePeriods}
          priceTypes={priceTypes}
          refLoading={refLoading}
        />
      </CustomDialog>

      <CustomDialog
        open={openEdit}
        title="Edit Code"
        onClose={() => setOpenEdit(false)}
        onSubmit={handleEditSubmit}
        submitText="Update"
        disabled={refLoading}
      >
        <FormFields
          formData={formData}
          errors={errors}
          onChange={(k, v) => setFormData((s) => ({ ...s, [k]: v }))}
          services={services}
          servicePeriods={servicePeriods}
          priceTypes={priceTypes}
          refLoading={refLoading}
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

/** ---- Reusable form ---- */
function FormFields({
  formData,
  errors,
  onChange,
  services,
  servicePeriods,
  priceTypes,
  refLoading,
}: {
  formData: FormState;
  errors: Record<keyof FormState, string>;
  onChange: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  services: Option[];
  servicePeriods: Option[];
  priceTypes: Option[];
  refLoading: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 mt-2">
      <TextField
        select
        label="Service"
        value={formData.service}
        onChange={(e) => onChange("service", e.target.value)}
        error={!!errors.service}
        helperText={errors.service}
        fullWidth
        disabled={refLoading}
      >
        {services.map((opt) => (
          <MenuItem key={opt.id} value={String(opt.id)}>
            {opt.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Service Period"
        value={formData.service_period}
        onChange={(e) => onChange("service_period", e.target.value)}
        error={!!errors.service_period}
        helperText={errors.service_period}
        fullWidth
        disabled={refLoading}
      >
        {servicePeriods.map((opt) => (
          <MenuItem key={opt.id} value={String(opt.id)}>
            {opt.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Price Type"
        value={formData.price_type}
        onChange={(e) => onChange("price_type", e.target.value)}
        error={!!errors.price_type}
        helperText={errors.price_type}
        fullWidth
        disabled={refLoading}
      >
        {priceTypes.map((opt) => (
          <MenuItem key={opt.id} value={String(opt.id)}>
            {opt.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Opening Time (HH:MM:SS)"
        type="time"
        value={formData.opening_time}
        onChange={(e) =>
          onChange("opening_time", e.target.value.includes(":") ? e.target.value : formatHMSInput(e.target.value))
        }
        onBlur={(e) => onChange("opening_time", normalizeToHMS(e.target.value))}
        error={!!errors.opening_time}
        helperText={errors.opening_time || "24h format, seconds allowed"}
        fullWidth
        inputProps={{ step: 1 }}
      />

      <TextField
        label="Closing Time (HH:MM:SS)"
        type="time"
        value={formData.closing_time}
        onChange={(e) =>
          onChange("closing_time", e.target.value.includes(":") ? e.target.value : formatHMSInput(e.target.value))
        }
        onBlur={(e) => onChange("closing_time", normalizeToHMS(e.target.value))}
        error={!!errors.closing_time}
        helperText={errors.closing_time || "24h format, seconds allowed"}
        fullWidth
        inputProps={{ step: 1 }}
      />

      <TextField
        label="Turnaround Time (Hours)"
        type="number"
        value={formData.turnaround_time}
        onChange={(e) => {
          const n = Math.max(1, parseInt(onlyInteger(e.target.value) || "1", 10));
          onChange("turnaround_time", n);
        }}
        onBlur={(e) => {
          const n = Math.max(1, parseInt(onlyInteger(e.target.value) || "1", 10));
          onChange("turnaround_time", n);
        }}
        error={!!errors.turnaround_time}
        helperText={errors.turnaround_time || "Hours ≥ 1"}
        fullWidth
        inputProps={{ min: 1, step: 1, inputMode: "numeric", pattern: "\\d*" }}
      />

      <TextField
        label="Min Quantity"
        type="number"
        value={formData.min_quantity}
        onChange={(e) => {
          const n = Math.max(1, parseInt(onlyInteger(e.target.value) || "1", 10));
          onChange("min_quantity", n);
        }}
        onBlur={(e) => {
          const n = Math.max(1, parseInt(onlyInteger(e.target.value) || "1", 10));
          onChange("min_quantity", n);
        }}
        error={!!errors.min_quantity}
        helperText={errors.min_quantity || "Integer ≥ 1"}
        fullWidth
        inputProps={{ min: 1, step: 1, inputMode: "numeric", pattern: "\\d*" }}
      />

      <TextField
        label="Service Period Price"
        type="number"
        value={formData.service_period_price}
        onChange={(e) => onChange("service_period_price", onlyDecimal(e.target.value))}
        onBlur={(e) => onChange("service_period_price", String(Math.max(0, Number(e.target.value || "0"))))}
        error={!!errors.service_period_price}
        helperText={errors.service_period_price || "Number ≥ 0"}
        fullWidth
        inputProps={{ step: "0.01", min: 0, inputMode: "decimal" }}
      />

      <TextField
        label="Service Price"
        type="number"
        value={formData.service_price}
        onChange={(e) => onChange("service_price", onlyDecimal(e.target.value))}
        onBlur={(e) => onChange("service_price", String(Math.max(0, Number(e.target.value || "0"))))}
        error={!!errors.service_price}
        helperText={errors.service_price || "Number ≥ 0"}
        fullWidth
        inputProps={{ step: "0.01", min: 0, inputMode: "decimal" }}
      />

      <TextField
        label="Pickup/Delivery Cost"
        type="number"
        value={formData.pickup_delivery_cost}
        onChange={(e) => onChange("pickup_delivery_cost", onlyDecimal(e.target.value))}
        onBlur={(e) => onChange("pickup_delivery_cost", String(Math.max(0, Number(e.target.value || "0"))))}
        error={!!errors.pickup_delivery_cost}
        helperText={errors.pickup_delivery_cost || "Number ≥ 0"}
        fullWidth
        inputProps={{ step: "0.01", min: 0, inputMode: "decimal" }}
      />
    </div>
  );
}
