// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import CommonTable from "@/components/Table";
// import CustomDialog from "@/components/Dialog";
// import { TextField, MenuItem } from "@mui/material";
// import axios from "axios";
// import { BASE_URL } from "@/utils/api";
// import { Button } from "@/components/ui/button";
// import { useSearchParams } from "next/navigation";

// type CodeRow = {
//   id?: number;
//   laundry?: number | null;
//   service?: number | string;
//   service_period?: number | string;
//   price_type?: number | string;
//   opening_time?: string;
//   closing_time?: string;
//   min_quantity?: number | string;
//   turnaround_time?: number | string;
//   service_period_price?: number | string;
//   service_price?: number | string;
//   pickup_delivery_cost?: number | string;
// };

// type Option = { id: number; label: string };

// // ---------- helpers ----------
// const clamp = (n: number, min: number, max: number) =>
//   isNaN(n) ? min : Math.min(max, Math.max(min, n));

// const formatHMSInput = (raw: string): string => {
//   const digits = raw.replace(/\D/g, "").slice(0, 6);
//   if (!digits) return "";
//   const h = digits.slice(0, 2);
//   const m = digits.slice(2, 4);
//   const s = digits.slice(4, 6);
//   const hh = String(clamp(parseInt(h || "0", 10), 0, 23)).padStart(2, "0");
//   const mm = String(clamp(parseInt(m || "0", 10), 0, 59)).padStart(2, "0");
//   const ss = String(clamp(parseInt(s || "0", 10), 0, 59)).padStart(2, "0");
//   return `${hh}:${mm}:${ss}`;
// };

// const normalizeToHMS = (val: string): string => {
//   if (!val) return "";
//   const parts = val.split(":");
//   if (parts.length === 2) {
//     const [H, M] = parts;
//     const hh = String(clamp(parseInt(H || "0", 10), 0, 23)).padStart(2, "0");
//     const mm = String(clamp(parseInt(M || "0", 10), 0, 59)).padStart(2, "0");
//     return `${hh}:${mm}:00`;
//   }
//   if (parts.length === 3) {
//     const [H, M, S] = parts;
//     const hh = String(clamp(parseInt(H || "0", 10), 0, 23)).padStart(2, "0");
//     const mm = String(clamp(parseInt(M || "0", 10), 0, 59)).padStart(2, "0");
//     const ss = String(clamp(parseInt(S || "0", 10), 0, 59)).padStart(2, "0");
//     return `${hh}:${mm}:${ss}`;
//   }
//   return formatHMSInput(val);
// };

// const onlyInteger = (raw: string) => raw.replace(/\D/g, "");

// const onlyDecimal = (raw: string) => {
//   let v = raw.replace(/[^0-9.]/g, "");
//   v = v.replace(/(\..*)\./g, "$1");
//   return v;
// };

// const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;

// // ============================================================

// export default function ServiceDeliveryCodesPage() {
//   const searchParams = useSearchParams();
//   const laundryId = searchParams.get("laundry_id");

//   const [codes, setCodes] = useState<CodeRow[]>([]);
//   const [loading, setLoading] = useState(true);

//   const [openAdd, setOpenAdd] = useState(false);
//   const [openEdit, setOpenEdit] = useState(false);
//   const [openDelete, setOpenDelete] = useState(false);

//   const [selectedRow, setSelectedRow] = useState<CodeRow | null>(null);
//   const [token, setToken] = useState<string | null>(null);

//   // dropdown options
//   const [services, setServices] = useState<Option[]>([]);
//   const [servicePeriods, setServicePeriods] = useState<Option[]>([]);
//   const [priceTypes, setPriceTypes] = useState<Option[]>([]);
//   const [refLoading, setRefLoading] = useState(false);

//   // form state (strings for controlled inputs; numbers when submitting)
//   const [formData, setFormData] = useState<Required<Omit<CodeRow, "id" | "laundry">>>({
//     service: "",
//     service_period: "",
//     price_type: "",
//     opening_time: "",
//     closing_time: "",
//     min_quantity: "",
//     turnaround_time: "",
//     service_period_price: "",
//     service_price: "",
//     pickup_delivery_cost: "",
//   });

//   const [errors, setErrors] = useState<Record<keyof typeof formData, string>>({
//     service: "",
//     service_period: "",
//     price_type: "",
//     opening_time: "",
//     closing_time: "",
//     min_quantity: "",
//     turnaround_time: "",
//     service_period_price: "",
//     service_price: "",
//     pickup_delivery_cost: "",
//   });

//   const toNumber = (v: any) =>
//     v === "" || v === null || v === undefined ? null : Number(v);

//   // ---------- validation ----------
//   const validate = () => {
//     const temp = { ...errors };
//     let ok = true;

//     // required
//     (Object.keys(formData) as (keyof typeof formData)[]).forEach((k) => {
//       const v = formData[k];
//       if (v === "" || v === null || v === undefined) {
//         temp[k] = `${k.replaceAll("_", " ")} is required`;
//         ok = false;
//       } else {
//         temp[k] = "";
//       }
//     });

//     // time fields
//     (["opening_time", "closing_time", "turnaround_time"] as const).forEach((k) => {
//       const val = String(formData[k]);
//       if (val && !timeRegex.test(val)) {
//         temp[k] = `${k.replaceAll("_", " ")} must be in HH:MM:SS format`;
//         ok = false;
//       }
//     });

//     // integer ≥ 1
//     if (formData.min_quantity !== "") {
//       const n = Number(formData.min_quantity);
//       if (isNaN(n) || n < 1 || !Number.isFinite(n) || !Number.isInteger(n)) {
//         temp.min_quantity = "Minimum quantity must be an integer ≥ 1";
//         ok = false;
//       }
//     }

//     // money/decimals ≥ 0
//     (["service_period_price", "service_price", "pickup_delivery_cost"] as const).forEach((k) => {
//       const n = Number(formData[k]);
//       if (isNaN(n) || n < 0) {
//         temp[k] = `${k.replaceAll("_", " ")} must be a number ≥ 0`;
//         ok = false;
//       }
//     });

//     setErrors(temp);
//     return ok;
//   };

//   // ---------- data fetching ----------
//   const fetchCodes = async () => {
//     if (!token) return;
//     try {
//       const url = laundryId
//         ? `${BASE_URL}service-delivery-codes/?laundry_id=${encodeURIComponent(
//             laundryId
//           )}`
//         : `${BASE_URL}service-delivery-codes/`;

//       const res = await axios.get(url, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = Array.isArray(res.data) ? res.data : res.data.results || [];
//       setCodes(data);
//     } catch (error) {
//       console.error("Error fetching service delivery codes:", error);
//       setCodes([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchReferenceData = async () => {
//     if (!token) return;
//     setRefLoading(true);
//     try {
//       const [svcRes, spRes, ptRes] = await Promise.all([
//         axios.get(`${BASE_URL}services/`, {
//           headers: { Authorization: `Bearer ${token}` },
//         }),
//         axios.get(`${BASE_URL}service-periods/`, {
//           headers: { Authorization: `Bearer ${token}` },
//         }),
//         axios.get(`${BASE_URL}price-types/`, {
//           headers: { Authorization: `Bearer ${token}` },
//         }),
//       ]);

//       const toArray = (res: any) =>
//         Array.isArray(res.data) ? res.data : res.data.results || [];

//       setServices(
//         toArray(svcRes).map((s: any) => ({
//           id: s.id,
//           label: s.service_name ?? `#${s.id}`,
//         }))
//       );
//       setServicePeriods(
//         toArray(spRes).map((p: any) => ({
//           id: p.id,
//           label: p.service_period_name ?? `#${p.id}`,
//         }))
//       );
//       setPriceTypes(
//         toArray(ptRes).map((p: any) => ({
//           id: p.id,
//           label: p.price_type_name ?? `#${p.id}`,
//         }))
//       );
//     } catch (e) {
//       console.error("Failed to fetch reference data", e);
//       setServices([]);
//       setServicePeriods([]);
//       setPriceTypes([]);
//     } finally {
//       setRefLoading(false);
//     }
//   };

//   // ---------- effects ----------
//   useEffect(() => {
//     const storedToken = localStorage.getItem("access_token");
//     setToken(storedToken);
//   }, []);

//   const didFetch = useRef(false);
//   useEffect(() => {
//     if (!token) return;
//     if (!didFetch.current) {
//       didFetch.current = true;
//       fetchCodes();
//     } else {
//       fetchCodes();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [token, laundryId]);

//   // ---------- dialog open handlers ----------
//   const handleAddOpen = async () => {
//     setFormData({
//       service: "",
//       service_period: "",
//       price_type: "",
//       opening_time: "",
//       closing_time: "",
//       min_quantity: "",
//       turnaround_time: "",
//       service_period_price: "",
//       service_price: "",
//       pickup_delivery_cost: "",
//     });
//     setErrors({
//       service: "",
//       service_period: "",
//       price_type: "",
//       opening_time: "",
//       closing_time: "",
//       min_quantity: "",
//       turnaround_time: "",
//       service_period_price: "",
//       service_price: "",
//       pickup_delivery_cost: "",
//     });
//     await fetchReferenceData();
//     setOpenAdd(true);
//   };

//   const handleEditOpen = async (row: CodeRow) => {
//     setSelectedRow(row);
//     setFormData({
//       service: String((row as any).service ?? ""),
//       service_period: String((row as any).service_period ?? ""),
//       price_type: String((row as any).price_type ?? ""),
//       opening_time: String((row as any).opening_time ?? ""),
//       closing_time: String((row as any).closing_time ?? ""),
//       min_quantity: String((row as any).min_quantity ?? ""),
//       turnaround_time: String((row as any).turnaround_time ?? ""),
//       service_period_price: String((row as any).service_period_price ?? ""),
//       service_price: String((row as any).service_price ?? ""),
//       pickup_delivery_cost: String((row as any).pickup_delivery_cost ?? ""),
//     });
//     await fetchReferenceData();
//     setOpenEdit(true);
//   };

//   // ---------- submit handlers ----------
//   const handleAddSubmit = async () => {
//     if (!validate() || !token) return;
//     if (!laundryId) {
//       alert("Missing laundry_id in URL. Cannot create code without a laundry.");
//       return;
//     }
//     try {
//       const payload: CodeRow = {
//         laundry: Number(laundryId),
//         service: Number(formData.service),
//         service_period: Number(formData.service_period),
//         price_type: Number(formData.price_type),
//         opening_time: normalizeToHMS(String(formData.opening_time)),
//         closing_time: normalizeToHMS(String(formData.closing_time)),
//         min_quantity: Number(formData.min_quantity),
//         turnaround_time: Number((formData.turnaround_time)),
//         service_period_price: Number(formData.service_period_price),
//         service_price: Number(formData.service_price),
//         pickup_delivery_cost: Number(formData.pickup_delivery_cost),
//       };

//       await axios.post(`${BASE_URL}service-delivery-codes/`, payload, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       setOpenAdd(false);
//       fetchCodes();
//     } catch (error) {
//       console.error("Error adding service delivery code:", error);
//     }
//   };

//   const handleEditSubmit = async () => {
//     if (!selectedRow || !validate() || !token) return;
//     try {
//       const payload: Partial<CodeRow> = {
//         ...(laundryId ? { laundry: Number(laundryId) } : {}),
//         service: Number(formData.service),
//         service_period: Number(formData.service_period),
//         price_type: Number(formData.price_type),
//         opening_time: normalizeToHMS(String(formData.opening_time)),
//         closing_time: normalizeToHMS(String(formData.closing_time)),
//         min_quantity: Number(formData.min_quantity),
//         turnaround_time: normalizeToHMS(String(formData.turnaround_time)),
//         service_period_price: Number(formData.service_period_price),
//         service_price: Number(formData.service_price),
//         pickup_delivery_cost: Number(formData.pickup_delivery_cost),
//       };

//       await axios.patch(
//         `${BASE_URL}service-delivery-codes/${selectedRow.id}/`,
//         payload,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       setOpenEdit(false);
//       fetchCodes();
//     } catch (error) {
//       console.error("Error editing service delivery code:", error);
//     }
//   };

//   const handleDeleteSubmit = async () => {
//     if (!selectedRow || !token) return;
//     try {
//       await axios.delete(
//         `${BASE_URL}service-delivery-codes/${selectedRow.id}/`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setOpenDelete(false);
//       fetchCodes();
//     } catch (error) {
//       console.error("Error deleting service delivery code:", error);
//     }
//   };

//   // ---------- UI ----------
//   if (loading) return <p>Loading...</p>;

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <h1 className="text-xl font-semibold">
//           Service Delivery Codes{laundryId ? ` — Laundry #${laundryId}` : ""}
//         </h1>
//         <Button
//           className="bg-blue-600 hover:bg-blue-700 text-white"
//           size="lg"
//           onClick={handleAddOpen}
//         >
//           Add New Code
//         </Button>
//       </div>

//       {/* Table */}
//       <CommonTable
//         data={codes}
//         onEdit={handleEditOpen}
//         onDelete={(row) => {
//           setSelectedRow(row);
//           setOpenDelete(true);
//         }}
//       />

//       {/* Add Dialog */}
//       <CustomDialog
//         open={openAdd}
//         title="Add New Service Delivery Code"
//         onClose={() => setOpenAdd(false)}
//         onSubmit={handleAddSubmit}
//         submitText="Save"
//         disabled={refLoading}
//       >
//         <FormFields
//           formData={formData}
//           errors={errors}
//           onChange={(k, v) => setFormData((s) => ({ ...s, [k]: v }))}
//           services={services}
//           servicePeriods={servicePeriods}
//           priceTypes={priceTypes}
//           refLoading={refLoading}
//         />
//       </CustomDialog>

//       {/* Edit Dialog */}
//       <CustomDialog
//         open={openEdit}
//         title="Edit Service Delivery Code"
//         onClose={() => setOpenEdit(false)}
//         onSubmit={handleEditSubmit}
//         submitText="Update"
//         disabled={refLoading}
//       >
//         <FormFields
//           formData={formData}
//           errors={errors}
//           onChange={(k, v) => setFormData((s) => ({ ...s, [k]: v }))}
//           services={services}
//           servicePeriods={servicePeriods}
//           priceTypes={priceTypes}
//           refLoading={refLoading}
//         />
//       </CustomDialog>

//       {/* Delete Confirmation */}
//       <CustomDialog
//         open={openDelete}
//         title="Confirm Delete"
//         onClose={() => setOpenDelete(false)}
//         onSubmit={handleDeleteSubmit}
//         submitText="Delete"
//         cancelText="Cancel"
//       >
//         <p>Are you sure you want to delete this service delivery code?</p>
//       </CustomDialog>
//     </div>
//   );
// }

// // ---------- Reusable form with dropdowns & formatted inputs ----------
// function FormFields({
//   formData,
//   errors,
//   onChange,
//   services,
//   servicePeriods,
//   priceTypes,
//   refLoading,
// }: {
//   formData: {
//     service: string | number;
//     service_period: string | number;
//     price_type: string | number;
//     opening_time: string;
//     closing_time: string;
//     min_quantity: string | number;
//     turnaround_time: string;
//     service_period_price: string | number;
//     service_price: string | number;
//     pickup_delivery_cost: string | number;
//   };
//   errors: Record<string, string>;
//   onChange: (key: keyof typeof formData, value: any) => void;
//   services: Option[];
//   servicePeriods: Option[];
//   priceTypes: Option[];
//   refLoading: boolean;
// }) {
//   return (
//     <div className="flex flex-col gap-4 mt-2">
//       {/* FK dropdowns (post IDs) */}
//       <TextField
//         select
//         label="Service"
//         value={formData.service}
//         onChange={(e) => onChange("service", e.target.value)}
//         error={!!errors.service}
//         helperText={errors.service}
//         fullWidth
//         disabled={refLoading}
//       >
//         {services.map((opt) => (
//           <MenuItem key={opt.id} value={String(opt.id)}>
//             {opt.label}
//           </MenuItem>
//         ))}
//       </TextField>

//       <TextField
//         select
//         label="Service Period"
//         value={formData.service_period}
//         onChange={(e) => onChange("service_period", e.target.value)}
//         error={!!errors.service_period}
//         helperText={errors.service_period}
//         fullWidth
//         disabled={refLoading}
//       >
//         {servicePeriods.map((opt) => (
//           <MenuItem key={opt.id} value={String(opt.id)}>
//             {opt.label}
//           </MenuItem>
//         ))}
//       </TextField>

//       <TextField
//         select
//         label="Price Type"
//         value={formData.price_type}
//         onChange={(e) => onChange("price_type", e.target.value)}
//         error={!!errors.price_type}
//         helperText={errors.price_type}
//         fullWidth
//         disabled={refLoading}
//       >
//         {priceTypes.map((opt) => (
//           <MenuItem key={opt.id} value={String(opt.id)}>
//             {opt.label}
//           </MenuItem>
//         ))}
//       </TextField>

//       {/* Times (type=time + seconds; normalize on blur) */}
//       <TextField
//         label="Opening Time (HH:MM:SS)"
//         type="time"
//         value={formData.opening_time}
//         onChange={(e) => {
//           const v = e.target.value;
//           const maybeTime = v.includes(":") ? v : formatHMSInput(v);
//           onChange("opening_time", maybeTime);
//         }}
//         onBlur={(e) => onChange("opening_time", normalizeToHMS(e.target.value))}
//         error={!!errors.opening_time}
//         helperText={errors.opening_time || "Use 24h, seconds allowed"}
//         fullWidth
//         inputProps={{ step: 1 }}
//       />

//       <TextField
//         label="Closing Time (HH:MM:SS)"
//         type="time"
//         value={formData.closing_time}
//         onChange={(e) => {
//           const v = e.target.value;
//           const maybeTime = v.includes(":") ? v : formatHMSInput(v);
//           onChange("closing_time", maybeTime);
//         }}
//         onBlur={(e) => onChange("closing_time", normalizeToHMS(e.target.value))}
//         error={!!errors.closing_time}
//         helperText={errors.closing_time || "Use 24h, seconds allowed"}
//         fullWidth
//         inputProps={{ step: 1 }}
//       />

// <TextField
//   label="Turnaround Time (Hours)"
//   type="number"
//   value={formData.turnaround_time}
//   onChange={(e) => {
//     const raw = onlyInteger(e.target.value);
//     const n = raw ? Math.max(1, parseInt(raw, 10)) : "";
//     onChange("turnaround_time", n);
//   }}
//   onBlur={(e) => {
//     const raw = onlyInteger(e.target.value);
//     const n = raw ? Math.max(1, parseInt(raw, 10)) : 1;
//     onChange("turnaround_time", n);
//   }}
//   error={!!errors.turnaround_time}
//   helperText={errors.turnaround_time || "Enter turnaround time in hours (≥1)"}
//   fullWidth
//   inputProps={{ inputMode: "numeric", pattern: "\\d*", step: 1, min: 1 }}
// />

//       {/* Integer (≥ 1) */}
//       <TextField
//         label="Min Quantity"
//         type="number"
//         value={formData.min_quantity}
//         onChange={(e) => {
//           const raw = onlyInteger(e.target.value);
//           const n = raw ? Math.max(1, parseInt(raw, 10)) : "";
//           onChange("min_quantity", n);
//         }}
//         onBlur={(e) => {
//           const raw = onlyInteger(e.target.value);
//           const n = raw ? Math.max(1, parseInt(raw, 10)) : 1;
//           onChange("min_quantity", n);
//         }}
//         error={!!errors.min_quantity}
//         helperText={errors.min_quantity || "Must be an integer ≥ 1"}
//         fullWidth
//         inputProps={{ inputMode: "numeric", pattern: "\\d*", step: 1, min: 1 }}
//       />

//       {/* Decimals (≥ 0) */}
//       <TextField
//         label="Service Period Price"
//         type="number"
//         value={formData.service_period_price}
//         onChange={(e) => onChange("service_period_price", onlyDecimal(e.target.value))}
//         onBlur={(e) => {
//           const v = e.target.value === "" ? "0" : e.target.value;
//           const n = Math.max(0, Number(v));
//           onChange("service_period_price", isNaN(n) ? "0" : String(n));
//         }}
//         error={!!errors.service_period_price}
//         helperText={errors.service_period_price || "Number ≥ 0"}
//         fullWidth
//         inputProps={{ inputMode: "decimal", min: 0, step: "0.01" }}
//       />

//       <TextField
//         label="Service Price"
//         type="number"
//         value={formData.service_price}
//         onChange={(e) => onChange("service_price", onlyDecimal(e.target.value))}
//         onBlur={(e) => {
//           const v = e.target.value === "" ? "0" : e.target.value;
//           const n = Math.max(0, Number(v));
//           onChange("service_price", isNaN(n) ? "0" : String(n));
//         }}
//         error={!!errors.service_price}
//         helperText={errors.service_price || "Number ≥ 0"}
//         fullWidth
//         inputProps={{ inputMode: "decimal", min: 0, step: "0.01" }}
//       />

//       <TextField
//         label="Pickup/Delivery Cost"
//         type="number"
//         value={formData.pickup_delivery_cost}
//         onChange={(e) => onChange("pickup_delivery_cost", onlyDecimal(e.target.value))}
//         onBlur={(e) => {
//           const v = e.target.value === "" ? "0" : e.target.value;
//           const n = Math.max(0, Number(v));
//           onChange("pickup_delivery_cost", isNaN(n) ? "0" : String(n));
//         }}
//         error={!!errors.pickup_delivery_cost}
//         helperText={errors.pickup_delivery_cost || "Number ≥ 0"}
//         fullWidth
//         inputProps={{ inputMode: "decimal", min: 0, step: "0.01" }}
//       />
//     </div>
//   );
// }


"use client";

import React, { useEffect, useRef, useState } from "react";
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
  turnaround_time?: number | string; // HOURS ONLY
  service_period_price?: number | string;
  service_price?: number | string;
  pickup_delivery_cost?: number | string;
};

type Option = { id: number; label: string };

// ---------- helpers ----------
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

// ============================================================

export default function ServiceDeliveryCodesPage() {
  const searchParams = useSearchParams();
  const laundryId = searchParams.get("laundry_id");

  const [codes, setCodes] = useState<CodeRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [selectedRow, setSelectedRow] = useState<CodeRow | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // dropdown options
  const [services, setServices] = useState<Option[]>([]);
  const [servicePeriods, setServicePeriods] = useState<Option[]>([]);
  const [priceTypes, setPriceTypes] = useState<Option[]>([]);
  const [refLoading, setRefLoading] = useState(false);

  // form state (strings for controlled inputs; numbers when submitting)
  const [formData, setFormData] = useState<Required<Omit<CodeRow, "id" | "laundry">>>({
    service: "",
    service_period: "",
    price_type: "",
    opening_time: "",
    closing_time: "",
    min_quantity: "",
    turnaround_time: "", // hours as string in UI
    service_period_price: "",
    service_price: "",
    pickup_delivery_cost: "",
  });

  const [errors, setErrors] = useState<Record<keyof typeof formData, string>>({
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

  const toNumber = (v: any) =>
    v === "" || v === null || v === undefined ? null : Number(v);

  // ---------- validation ----------
  const validate = () => {
    const temp = { ...errors };
    let ok = true;

    // required
    (Object.keys(formData) as (keyof typeof formData)[]).forEach((k) => {
      const v = formData[k];
      if (v === "" || v === null || v === undefined) {
        temp[k] = `${k.replaceAll("_", " ")} is required`;
        ok = false;
      } else {
        temp[k] = "";
      }
    });

    // time fields: ONLY opening_time & closing_time
    (["opening_time", "closing_time"] as const).forEach((k) => {
      const val = String(formData[k]);
      if (val && !timeRegex.test(val)) {
        temp[k] = `${k.replaceAll("_", " ")} must be in HH:MM:SS format`;
        ok = false;
      }
    });

    // turnaround_time: integer hours ≥ 1
    if (formData.turnaround_time !== "") {
      const n = Number(formData.turnaround_time);
      if (isNaN(n) || !Number.isInteger(n) || n < 1) {
        temp.turnaround_time = "Turnaround time must be an integer number of hours (≥ 1)";
        ok = false;
      }
    }

    // integer ≥ 1
    if (formData.min_quantity !== "") {
      const n = Number(formData.min_quantity);
      if (isNaN(n) || n < 1 || !Number.isFinite(n) || !Number.isInteger(n)) {
        temp.min_quantity = "Minimum quantity must be an integer ≥ 1";
        ok = false;
      }
    }

    // money/decimals ≥ 0
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

  // ---------- data fetching ----------
  const fetchCodes = async () => {
    if (!token) return;
    try {
      const url = laundryId
        ? `${BASE_URL}service-delivery-codes/?laundry_id=${encodeURIComponent(
            laundryId
          )}`
        : `${BASE_URL}service-delivery-codes/`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setCodes(data);
    } catch (error) {
      console.error("Error fetching service delivery codes:", error);
      setCodes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchReferenceData = async () => {
    if (!token) return;
    setRefLoading(true);
    try {
      const [svcRes, spRes, ptRes] = await Promise.all([
        axios.get(`${BASE_URL}services/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}service-periods/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}price-types/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const toArray = (res: any) =>
        Array.isArray(res.data) ? res.data : res.data.results || [];

      setServices(
        toArray(svcRes).map((s: any) => ({
          id: s.id,
          label: s.service_name ?? `#${s.id}`,
        }))
      );
      setServicePeriods(
        toArray(spRes).map((p: any) => ({
          id: p.id,
          label: p.service_period_name ?? `#${p.id}`,
        }))
      );
      setPriceTypes(
        toArray(ptRes).map((p: any) => ({
          id: p.id,
          label: p.price_type_name ?? `#${p.id}`,
        }))
      );
    } catch (e) {
      console.error("Failed to fetch reference data", e);
      setServices([]);
      setServicePeriods([]);
      setPriceTypes([]);
    } finally {
      setRefLoading(false);
    }
  };

  // ---------- effects ----------
  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");
    setToken(storedToken);
  }, []);

  const didFetch = useRef(false);
  useEffect(() => {
    if (!token) return;
    if (!didFetch.current) {
      didFetch.current = true;
      fetchCodes();
    } else {
      fetchCodes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, laundryId]);

  // ---------- dialog open handlers ----------
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
    setErrors({
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
      service: String((row as any).service ?? ""),
      service_period: String((row as any).service_period ?? ""),
      price_type: String((row as any).price_type ?? ""),
      opening_time: String((row as any).opening_time ?? ""),
      closing_time: String((row as any).closing_time ?? ""),
      min_quantity: String((row as any).min_quantity ?? ""),
      turnaround_time: String((row as any).turnaround_time ?? ""),
      service_period_price: String((row as any).service_period_price ?? ""),
      service_price: String((row as any).service_price ?? ""),
      pickup_delivery_cost: String((row as any).pickup_delivery_cost ?? ""),
    });
    await fetchReferenceData();
    setOpenEdit(true);
  };

  // ---------- submit handlers ----------
  const handleAddSubmit = async () => {
    if (!validate() || !token) return;
    if (!laundryId) {
      alert("Missing laundry_id in URL. Cannot create code without a laundry.");
      return;
    }
    try {
      const payload: CodeRow = {
        laundry: Number(laundryId),
        service: Number(formData.service),
        service_period: Number(formData.service_period),
        price_type: Number(formData.price_type),
        opening_time: normalizeToHMS(String(formData.opening_time)),
        closing_time: normalizeToHMS(String(formData.closing_time)),
        min_quantity: Number(formData.min_quantity),
        turnaround_time: Number(formData.turnaround_time), // HOURS as number
        service_period_price: Number(formData.service_period_price),
        service_price: Number(formData.service_price),
        pickup_delivery_cost: Number(formData.pickup_delivery_cost),
      };

      await axios.post(`${BASE_URL}service-delivery-codes/`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOpenAdd(false);
      fetchCodes();
    } catch (error) {
      console.error("Error adding service delivery code:", error);
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
        opening_time: normalizeToHMS(String(formData.opening_time)),
        closing_time: normalizeToHMS(String(formData.closing_time)),
        min_quantity: Number(formData.min_quantity),
        turnaround_time: Number(formData.turnaround_time), // <-- FIXED (was normalizeToHMS)
        service_period_price: Number(formData.service_period_price),
        service_price: Number(formData.service_price),
        pickup_delivery_cost: Number(formData.pickup_delivery_cost),
      };

      await axios.patch(
        `${BASE_URL}service-delivery-codes/${selectedRow.id}/`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOpenEdit(false);
      fetchCodes();
    } catch (error) {
      console.error("Error editing service delivery code:", error);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedRow || !token) return;
    try {
      await axios.delete(
        `${BASE_URL}service-delivery-codes/${selectedRow.id}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOpenDelete(false);
      fetchCodes();
    } catch (error) {
      console.error("Error deleting service delivery code:", error);
    }
  };

  // ---------- UI ----------
  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          Service Delivery Codes{laundryId ? ` — Laundry #${laundryId}` : ""}
        </h1>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
          onClick={handleAddOpen}
        >
          Add New Code
        </Button>
      </div>

      {/* Table */}
      <CommonTable
        data={codes}
        onEdit={handleEditOpen}
        onDelete={(row) => {
          setSelectedRow(row);
          setOpenDelete(true);
        }}
      />

      {/* Add Dialog */}
      <CustomDialog
        open={openAdd}
        title="Add New Service Delivery Code"
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

      {/* Edit Dialog */}
      <CustomDialog
        open={openEdit}
        title="Edit Service Delivery Code"
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

      {/* Delete Confirmation */}
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

// ---------- Reusable form with dropdowns & formatted inputs ----------
function FormFields({
  formData,
  errors,
  onChange,
  services,
  servicePeriods,
  priceTypes,
  refLoading,
}: {
  formData: {
    service: string | number;
    service_period: string | number;
    price_type: string | number;
    opening_time: string;
    closing_time: string;
    min_quantity: string | number;
    turnaround_time: string | number; // HOURS
    service_period_price: string | number;
    service_price: string | number;
    pickup_delivery_cost: string | number;
  };
  errors: Record<string, string>;
  onChange: (key: keyof typeof formData, value: any) => void;
  services: Option[];
  servicePeriods: Option[];
  priceTypes: Option[];
  refLoading: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 mt-2">
      {/* FK dropdowns (post IDs) */}
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

      {/* Times (type=time + seconds; normalize on blur) */}
      <TextField
        label="Opening Time (HH:MM:SS)"
        type="time"
        value={formData.opening_time}
        onChange={(e) => {
          const v = e.target.value;
          const maybeTime = v.includes(":") ? v : formatHMSInput(v);
          onChange("opening_time", maybeTime);
        }}
        onBlur={(e) => onChange("opening_time", normalizeToHMS(e.target.value))}
        error={!!errors.opening_time}
        helperText={errors.opening_time || "Use 24h, seconds allowed"}
        fullWidth
        inputProps={{ step: 1 }}
      />

      <TextField
        label="Closing Time (HH:MM:SS)"
        type="time"
        value={formData.closing_time}
        onChange={(e) => {
          const v = e.target.value;
          const maybeTime = v.includes(":") ? v : formatHMSInput(v);
          onChange("closing_time", maybeTime);
        }}
        onBlur={(e) => onChange("closing_time", normalizeToHMS(e.target.value))}
        error={!!errors.closing_time}
        helperText={errors.closing_time || "Use 24h, seconds allowed"}
        fullWidth
        inputProps={{ step: 1 }}
      />

      {/* HOURS ONLY */}
      <TextField
        label="Turnaround Time (Hours)"
        type="number"
        value={formData.turnaround_time}
        onChange={(e) => {
          const raw = onlyInteger(e.target.value);
          const n = raw ? Math.max(1, parseInt(raw, 10)) : "";
          onChange("turnaround_time", n);
        }}
        onBlur={(e) => {
          const raw = onlyInteger(e.target.value);
          const n = raw ? Math.max(1, parseInt(raw, 10)) : 1;
          onChange("turnaround_time", n);
        }}
        error={!!errors.turnaround_time}
        helperText={errors.turnaround_time || "Enter turnaround time in hours (≥ 1)"}
        fullWidth
        inputProps={{ inputMode: "numeric", pattern: "\\d*", step: 1, min: 1 }}
      />

      {/* Integer (≥ 1) */}
      <TextField
        label="Min Quantity"
        type="number"
        value={formData.min_quantity}
        onChange={(e) => {
          const raw = onlyInteger(e.target.value);
          const n = raw ? Math.max(1, parseInt(raw, 10)) : "";
          onChange("min_quantity", n);
        }}
        onBlur={(e) => {
          const raw = onlyInteger(e.target.value);
          const n = raw ? Math.max(1, parseInt(raw, 10)) : 1;
          onChange("min_quantity", n);
        }}
        error={!!errors.min_quantity}
        helperText={errors.min_quantity || "Must be an integer ≥ 1"}
        fullWidth
        inputProps={{ inputMode: "numeric", pattern: "\\d*", step: 1, min: 1 }}
      />

      {/* Decimals (≥ 0) */}
      <TextField
        label="Service Period Price"
        type="number"
        value={formData.service_period_price}
        onChange={(e) => onChange("service_period_price", onlyDecimal(e.target.value))}
        onBlur={(e) => {
          const v = e.target.value === "" ? "0" : e.target.value;
          const n = Math.max(0, Number(v));
          onChange("service_period_price", isNaN(n) ? "0" : String(n));
        }}
        error={!!errors.service_period_price}
        helperText={errors.service_period_price || "Number ≥ 0"}
        fullWidth
        inputProps={{ inputMode: "decimal", min: 0, step: "0.01" }}
      />

      <TextField
        label="Service Price"
        type="number"
        value={formData.service_price}
        onChange={(e) => onChange("service_price", onlyDecimal(e.target.value))}
        onBlur={(e) => {
          const v = e.target.value === "" ? "0" : e.target.value;
          const n = Math.max(0, Number(v));
          onChange("service_price", isNaN(n) ? "0" : String(n));
        }}
        error={!!errors.service_price}
        helperText={errors.service_price || "Number ≥ 0"}
        fullWidth
        inputProps={{ inputMode: "decimal", min: 0, step: "0.01" }}
      />

      <TextField
        label="Pickup/Delivery Cost"
        type="number"
        value={formData.pickup_delivery_cost}
        onChange={(e) => onChange("pickup_delivery_cost", onlyDecimal(e.target.value))}
        onBlur={(e) => {
          const v = e.target.value === "" ? "0" : e.target.value;
          const n = Math.max(0, Number(v));
          onChange("pickup_delivery_cost", isNaN(n) ? "0" : String(n));
        }}
        error={!!errors.pickup_delivery_cost}
        helperText={errors.pickup_delivery_cost || "Number ≥ 0"}
        fullWidth
        inputProps={{ inputMode: "decimal", min: 0, step: "0.01" }}
      />
    </div>
  );
}
