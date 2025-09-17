// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import CustomDialog from "@/components/Dialog";
// import { BASE_URL } from "@/utils/api";
// import axios from "axios";
// import { fetchLaundries } from "@/utils/api"; // ← your function from the prompt

// type Laundry = {
//   id: number;
//   name: string;
//   contact_info?: string | null;
//   address?: string | null;
//   pincode?: string | null;
//   lat?: string | null;
//   long?: string | null;
//   // If backend returns this (recommended)
//   services_count?: number;
// };

// type ServiceDeliveryCode = {
//   id: number;
//   opening_time: string;
//   closing_time: string;
//   min_quantity: number;
//   turnaround_time: string;
//   service_period_price: number;
//   service_price: number;
//   pickup_delivery_cost: number;
//   service?: string | number;
//   service_period?: string | number;
//   price_type?: string | number;
// };

// export default function LaundryListPage() {
//   const [laundries, setLaundries] = useState<Laundry[]>([]);
//   const [loading, setLoading] = useState(true);

//   // Dialogs
//   const [openServiceDlg, setOpenServiceDlg] = useState(false);
//   const [openDetailDlg, setOpenDetailDlg] = useState(false);

//   const [activeLaundry, setActiveLaundry] = useState<Laundry | null>(null);
//   const [serviceCodes, setServiceCodes] = useState<ServiceDeliveryCode[]>([]);
//   const [servicesLoading, setServicesLoading] = useState(false);

//   // --- helpers ---------------------------------------------------------------
//   const getAuthHeaders = () => {
//     const token = localStorage.getItem("access_token");
//     return token ? { Authorization: `Bearer ${token}` } : {};
//   };

//   // Optional: if your backend does not yet send services_count, you can
//   // compute it from a cached map after opening the drawer. Here we simply
//   // display whatever the API returns and fallback to "-" if missing.
//   const rows = useMemo(() => laundries ?? [], [laundries]);

//   // --- data ------------------------------------------------------------------
//   const loadLaundries = async () => {
//     try {
//       const token = localStorage.getItem("access_token") || "";
//       const data = await fetchLaundries(token);
//       const list = Array.isArray(data) ? data : data?.results || [];
//       setLaundries(list);
//     } catch (e) {
//       console.error("Failed to load laundries:", e);
//       setLaundries([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Load service-delivery codes for one laundry (drawer)
//   const loadServiceCodes = async (laundryId: number) => {
//     setServicesLoading(true);
//     try {
//       // If you followed the earlier suggestion:
//       //   GET /laundary/:id/service-delivery-codes/
//       // If your path differs, adjust here.
//       const res = await axios.get(
//         `${BASE_URL}laundary/${laundryId}/service-delivery-codes/`,
//         { headers: getAuthHeaders() }
//       );
//       const data = Array.isArray(res.data) ? res.data : res.data?.items || [];
//       setServiceCodes(data);
//     } catch (e) {
//       console.error("Failed to load service codes:", e);
//       setServiceCodes([]);
//     } finally {
//       setServicesLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadLaundries();
//   }, []);

//   // --- UI --------------------------------------------------------------------
//     if (loading) {
// return (
//   <div className="flex items-center justify-center h-screen">
//     <p className="text-xl font-bold">Loading...</p>
//   </div>
// );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-xl font-semibold">Laundries</h1>
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto border rounded-md">
//         <table className="min-w-full text-sm">
//           <thead className="bg-gray-50 text-gray-600">
//             <tr>
//               <th className="px-4 py-3 text-left">ID</th>
//               <th className="px-4 py-3 text-left">Laundry Name</th>
//               <th className="px-4 py-3 text-left">Contact Number</th>
//               <th className="px-4 py-3 text-left">No. of Services</th>
//               <th className="px-4 py-3 text-left">View Service</th>
//               <th className="px-4 py-3 text-left">View Laundry Detail</th>
//             </tr>
//           </thead>
//           <tbody>
//             {rows.map((l) => (
//               <tr key={l.id} className="border-t">
//                 <td className="px-4 py-3">{l.id}</td>
//                 <td className="px-4 py-3">{l.name}</td>
//                 <td className="px-4 py-3">{l.contact_info || "-"}</td>
//                 <td className="px-4 py-3">
//                   {typeof l.services_count === "number" ? l.services_count : "-"}
//                 </td>
//                 <td className="px-4 py-3">
//                   <button
//                     className="px-3 py-1 rounded-md bg-blue-600 text-white"
//                     onClick={() => {
//                       setActiveLaundry(l);
//                       setOpenServiceDlg(true);
//                       loadServiceCodes(l.id);
//                     }}
//                   >
//                     View
//                   </button>
//                 </td>
//                 <td className="px-4 py-3">
//                   <button
//                     className="px-3 py-1 rounded-md bg-gray-800 text-white"
//                     onClick={() => {
//                       setActiveLaundry(l);
//                       setOpenDetailDlg(true);
//                     }}
//                   >
//                     View
//                   </button>
//                 </td>
//               </tr>
//             ))}

//             {rows.length === 0 && (
//               <tr>
//                 <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
//                   No laundries found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* --- View Service modal --- */}
//       <CustomDialog
//         open={openServiceDlg}
//         onClose={() => {
//           setOpenServiceDlg(false);
//           setServiceCodes([]);
//         }}
//         title={
//           activeLaundry
//             ? `${activeLaundry.name} — Service Delivery Codes`
//             : "Service Delivery Codes"
//         }

//       >
//         <div className="min-w-[760px]">
//           {servicesLoading ? (
//             <p className="p-4">Loading services…</p>
//           ) : serviceCodes.length === 0 ? (
//             <p className="p-4 text-gray-600">No service codes found.</p>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="min-w-full text-sm">
//                 <thead className="bg-gray-50 text-gray-600">
//                   <tr>
//                     <th className="px-3 py-2 text-left">ID</th>
//                     <th className="px-3 py-2 text-left">Opening</th>
//                     <th className="px-3 py-2 text-left">Closing</th>
//                     <th className="px-3 py-2 text-left">Min Qty</th>
//                     <th className="px-3 py-2 text-left">Turnaround</th>
//                     <th className="px-3 py-2 text-left">Service Period Price</th>
//                     <th className="px-3 py-2 text-left">Service Price</th>
//                     <th className="px-3 py-2 text-left">Pickup/Delivery Cost</th>
//                     <th className="px-3 py-2 text-left">Service</th>
//                     <th className="px-3 py-2 text-left">Service Period</th>
//                     <th className="px-3 py-2 text-left">Price Type</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {serviceCodes.map((row) => (
//                     <tr key={row.id} className="border-t">
//                       <td className="px-3 py-2">{row.id}</td>
//                       <td className="px-3 py-2">{row.opening_time}</td>
//                       <td className="px-3 py-2">{row.closing_time}</td>
//                       <td className="px-3 py-2">{row.min_quantity}</td>
//                       <td className="px-3 py-2">{row.turnaround_time}</td>
//                       <td className="px-3 py-2">{row.service_period_price}</td>
//                       <td className="px-3 py-2">{row.service_price}</td>
//                       <td className="px-3 py-2">{row.pickup_delivery_cost}</td>
//                       <td className="px-3 py-2">{row.service ?? "-"}</td>
//                       <td className="px-3 py-2">{row.service_period ?? "-"}</td>
//                       <td className="px-3 py-2">{row.price_type ?? "-"}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </CustomDialog>

//       {/* --- View Laundry Detail modal --- */}
//       <CustomDialog
//         open={openDetailDlg}
//         onClose={() => setOpenDetailDlg(false)}
//         title={activeLaundry ? `${activeLaundry.name} — Details` : "Laundry Details"}

//       >
//         {activeLaundry ? (
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-2">
//             <Field label="Name" value={activeLaundry.name} />
//             <Field label="Contact" value={activeLaundry.contact_info || "-"} />
//             <Field label="Pincode" value={activeLaundry.pincode || "-"} />
//             <Field label="Latitude" value={activeLaundry.lat || "-"} />
//             <Field label="Longitude" value={activeLaundry.long || "-"} />
//             <div className="sm:col-span-2">
//               <Field label="Address" value={activeLaundry.address || "-"} />
//             </div>
//           </div>
//         ) : (
//           <p className="p-4">No laundry selected.</p>
//         )}
//       </CustomDialog>
//     </div>
//   );
// }

// // small helper for detail view
// function Field({ label, value }: { label: string; value: React.ReactNode }) {
//   return (
//     <div className="text-sm">
//       <div className="text-gray-500">{label}</div>
//       <div className="font-medium">{value}</div>
//     </div>
//   );
// }



// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import CustomDialog from "@/components/Dialog";
// import { useRouter } from "next/navigation";
// import { fetchLaundries } from "@/utils/api";

// type Laundry = {
//   id: number;
//   name: string;
//   contact_info?: string | null;
//   address?: string | null;
//   pincode?: string | null;
//   lat?: string | null;
//   long?: string | null;
//   services_count?: number;
// };

// export default function LaundryListPage() {
//   const router = useRouter();

//   const [laundries, setLaundries] = useState<Laundry[]>([]);
//   const [loading, setLoading] = useState(true);

//   // Detail dialog only (services now navigate)
//   const [openDetailDlg, setOpenDetailDlg] = useState(false);
//   const [activeLaundry, setActiveLaundry] = useState<Laundry | null>(null);

//   const rows = useMemo(() => laundries ?? [], [laundries]);

//   const loadLaundries = async () => {
//     try {
//       const token = localStorage.getItem("access_token") || "";
//       const data = await fetchLaundries(token);
//       const list = Array.isArray(data) ? data : data?.results || [];
//       setLaundries(list);
//     } catch (e) {
//       console.error("Failed to load laundries:", e);
//       setLaundries([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadLaundries();
//   }, []);

//     if (loading) {
// return (
//   <div className="flex items-center justify-center h-screen">
//     <p className="text-xl font-bold">Loading...</p>
//   </div>
// );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-xl font-semibold">Laundries</h1>
//       </div>

//       <div className="overflow-x-auto border rounded-md">
//         <table className="min-w-full text-sm">
//           <thead className="bg-gray-50 text-gray-600">
//             <tr>
//               <th className="px-4 py-3 text-left">ID</th>
//               <th className="px-4 py-3 text-left">Laundry Name</th>
//               <th className="px-4 py-3 text-left">Contact Number</th>
//               <th className="px-4 py-3 text-left">No. of Services</th>
//               <th className="px-4 py-3 text-left">View Service</th>
//               <th className="px-4 py-3 text-left">View Laundry Detail</th>
//             </tr>
//           </thead>
//           <tbody>
//             {rows.map((l) => (
//               <tr key={l.id} className="border-t">
//                 <td className="px-4 py-3">{l.id}</td>
//                 <td className="px-4 py-3">{l.name}</td>
//                 <td className="px-4 py-3">{l.contact_info || "-"}</td>
//                 <td className="px-4 py-3">
//                   {typeof l.services_count === "number" ? l.services_count : "-"}
//                 </td>
//                 <td className="px-4 py-3">
//                   <button
//                     className="px-3 py-1 rounded-md bg-blue-600 text-white"
//                     onClick={() => {
//                       // 👉 Navigate to the Service Delivery Codes page with laundry filter
//                       router.push(`/Dashboard/ServiceperiodCode?laundry_id=${l.id}`);
//                     }}
//                   >
//                     View
//                   </button>
//                 </td>
//                 <td className="px-4 py-3">
//                   <button
//                     className="px-3 py-1 rounded-md bg-gray-800 text-white"
//                     onClick={() => {
//                       setActiveLaundry(l);
//                       setOpenDetailDlg(true);
//                     }}
//                   >
//                     View
//                   </button>
//                 </td>
//               </tr>
//             ))}

//             {rows.length === 0 && (
//               <tr>
//                 <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
//                   No laundries found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* --- View Laundry Detail modal --- */}
//       <CustomDialog
//         open={openDetailDlg}
//         onClose={() => setOpenDetailDlg(false)}
//         title={activeLaundry ? `${activeLaundry.name} — Details` : "Laundry Details"}
//       >
//         {activeLaundry ? (
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-2">
//             <Field label="Name" value={activeLaundry.name} />
//             <Field label="Contact" value={activeLaundry.contact_info || "-"} />
//             <Field label="Pincode" value={activeLaundry.pincode || "-"} />
//             <Field label="Latitude" value={activeLaundry.lat || "-"} />
//             <Field label="Longitude" value={activeLaundry.long || "-"} />
//             <div className="sm:col-span-2">
//               <Field label="Address" value={activeLaundry.address || "-"} />
//             </div>
//           </div>
//         ) : (
//           <p className="p-4">No laundry selected.</p>
//         )}
//       </CustomDialog>
//     </div>
//   );
// }

// function Field({ label, value }: { label: string; value: React.ReactNode }) {
//   return (
//     <div className="text-sm">
//       <div className="text-gray-500">{label}</div>
//       <div className="font-medium">{value}</div>
//     </div>
//   );
// }


// "use client";

// import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import CustomDialog from "@/components/Dialog";
// import { useRouter } from "next/navigation";
// import { fetchLaundries, BASE_URL } from "@/utils/api";
// import axios from "axios";
// import { TextField, IconButton } from "@mui/material";
// import { Button } from "@/components/ui/button";
// import { Trash2 } from "lucide-react";

// type Laundry = {
//   id: number;
//   name: string;
//   contact_info?: string | null;
//   address?: string | null;
//   pincode?: string | null;
//   // Allow number|string|null, since APIs differ; we normalize safely.
//   lat?: number | string | null;
//   long?: number | string | null;
//   services_count?: number;
// };

// type RawLaundry = {
//   id?: number | string;
//   name?: string;
//   contact_info?: string | null;
//   address?: string | null;
//   pincode?: string | null;
//   services_count?: number;

//   // coordinate variants from different APIs
//   lat?: number | string | null;
//   long?: number | string | null;
//   latitude?: number | string | null;
//   Longitude?: number | string | null;
//   Latitude?: number | string | null;
//   lng?: number | string | null;

//   // allow extra keys without using `any`
//   [key: string]: unknown;
// };

// type LaundryFormState = {
//   name: string;
//   contact_info: string;
//   address: string;
//   pincode: string;
//   lat: string; // form uses strings
//   long: string; // form uses strings
// };

// type LaundryFormErrors = {
//   name?: string;
//   contact_info?: string;
//   address?: string;
//   pincode?: string;
//   lat?: string;
//   long?: string;
// };

// export default function LaundryListPage() {
//   const router = useRouter();

//   const [laundries, setLaundries] = useState<Laundry[]>([]);
//   const [loading, setLoading] = useState(true);

//   // Detail dialog (contains Edit button)
//   const [openDetailDlg, setOpenDetailDlg] = useState(false);
//   const [activeLaundry, setActiveLaundry] = useState<Laundry | null>(null);

//   // Add/Edit/Delete dialogs
//   const [openAdd, setOpenAdd] = useState(false);
//   const [openEdit, setOpenEdit] = useState(false);
//   const [openDelete, setOpenDelete] = useState(false);

//   const [selectedLaundry, setSelectedLaundry] = useState<Laundry | null>(null);

//   // Form state + errors
//   const [formData, setFormData] = useState<LaundryFormState>({
//     name: "",
//     contact_info: "",
//     address: "",
//     pincode: "",
//     lat: "",
//     long: "",
//   });
//   const [errors, setErrors] = useState<LaundryFormErrors>({});

//   const rows = useMemo(() => laundries ?? [], [laundries]);

//   const getAuthHeaders = (): Record<string, string> => {
//     const token = localStorage.getItem("access_token") || "";
//     return token
//       ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
//       : { "Content-Type": "application/json" };
//   };

//   // Safely coerce any incoming coord value to string|number|null
//   const toCoord = (v: unknown): string | number | null => {
//     if (v === null || v === undefined) return null;
//     if (typeof v === "string" || typeof v === "number") return v;
//     // Anything else (e.g., {}), treat as null to avoid '{}' leaking into value props
//     return null;
//   };

//   // Normalize field names from backend so UI always has { lat, long }
//   const normalizeLaundryList = (listRaw: RawLaundry[]): Laundry[] =>
//     (listRaw ?? [])
//       .map((r): Laundry | null => {
//         const idNum = Number(r.id);
//         if (!Number.isFinite(idNum)) return null; // require a valid id

//         return {
//           id: idNum,
//           name: r.name ?? "",
//           contact_info: r.contact_info ?? null,
//           address: r.address ?? null,
//           pincode: r.pincode ?? null,
//           lat: toCoord(r.lat ?? r.latitude ?? r.Latitude ?? null),
//           long: toCoord(r.long ?? r.lng ?? r.longitude ?? r.Longitude ?? null),
//           services_count:
//             typeof r.services_count === "number" ? r.services_count : undefined,
//         };
//       })
//       .filter((x): x is Laundry => x !== null);

//   const loadLaundries = useCallback(async () => {
//     try {
//       const token = localStorage.getItem("access_token") || "";
//       const data: unknown = await fetchLaundries(token);
//       const listRaw: RawLaundry[] = Array.isArray(data)
//         ? (data as RawLaundry[])
//         : ((data as { results?: RawLaundry[] })?.results ?? []);
//       const list = normalizeLaundryList(listRaw);
//       setLaundries(list);
//     } catch (e) {
//       // eslint-disable-next-line no-console
//       console.error("Failed to load laundries:", e);
//       setLaundries([]);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Validation
//   const validate = (state: LaundryFormState) => {
//     const nextErrors: LaundryFormErrors = {};
//     if (!state.name?.trim()) nextErrors.name = "Name is required";
//     if (state.pincode && !/^\d{4,10}$/.test(state.pincode.trim())) {
//       nextErrors.pincode = "Enter a valid pincode (4–10 digits)";
//     }
//     if (state.lat && isNaN(Number(state.lat)))
//       nextErrors.lat = "Latitude must be a number";
//     if (state.long && isNaN(Number(state.long)))
//       nextErrors.long = "Longitude must be a number";
//     setErrors(nextErrors);
//     return Object.keys(nextErrors).length === 0;
//   };

//   // Add
//   const handleAddSubmit = async () => {
//     if (!validate(formData)) return;
//     try {
//       await axios.post(
//         `${BASE_URL}laundary/`,
//         {
//           name: formData.name || "",
//           contact_info: formData.contact_info || null,
//           address: formData.address || null,
//           pincode: formData.pincode || null,
//           lat: formData.lat || null,
//           long: formData.long || null,
//         },
//         { headers: getAuthHeaders() }
//       );
//       setOpenAdd(false);
//       resetForm();
//       await loadLaundries();
//     } catch (error) {
//       // eslint-disable-next-line no-console
//       console.error("Error adding laundry:", error);
//     }
//   };

//   // Edit (opened from detail dialog only)
//   const handleEditSubmit = async () => {
//     if (!selectedLaundry) return;
//     if (!validate(formData)) return;
//     try {
//       await axios.patch(
//         `${BASE_URL}laundary/${selectedLaundry.id}/`,
//         {
//           name: formData.name || "",
//           contact_info: formData.contact_info || null,
//           address: formData.address || null,
//           pincode: formData.pincode || null,
//           lat: formData.lat || null,
//           long: formData.long || null,
//         },
//         { headers: getAuthHeaders() }
//       );
//       setOpenEdit(false);
//       setSelectedLaundry(null);
//       resetForm();
//       await loadLaundries();
//     } catch (error) {
//       // eslint-disable-next-line no-console
//       console.error("Error editing laundry:", error);
//     }
//   };

//   // Delete
//   const handleDeleteSubmit = async () => {
//     if (!selectedLaundry) return;
//     try {
//       await axios.delete(`${BASE_URL}laundary/${selectedLaundry.id}/`, {
//         headers: getAuthHeaders(),
//       });
//       setOpenDelete(false);
//       setSelectedLaundry(null);
//       await loadLaundries();
//     } catch (error) {
//       // eslint-disable-next-line no-console
//       console.error("Error deleting laundry:", error);
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       name: "",
//       contact_info: "",
//       address: "",
//       pincode: "",
//       lat: "",
//       long: "",
//     });
//     setErrors({});
//   };

//   const didFetch = useRef(false);
//   useEffect(() => {
//     if (didFetch.current) return;
//     didFetch.current = true;
//     loadLaundries();
//   }, [loadLaundries]);

//     if (loading) {
// return (
//   <div className="flex items-center justify-center h-screen">
//     <p className="text-xl font-bold">Loading...</p>
//   </div>
// );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex justify-end">
//         {/* <h1 className="text-xl font-semibold">Laundries</h1> */}
//         <Button
//           className="bg-blue-600 hover:bg-blue-700 text-white mt-3 ml-3"
//           size="lg"
//           onClick={() => {
//             resetForm();
//             setOpenAdd(true);
//           }}
//         >
//           Add New Laundry
//         </Button>
//       </div>

//       <div className="overflow-x-auto border rounded-md">
//         <table className="min-w-full text-sm">
//           <thead className="bg-gray-50 text-gray-600">
//             <tr>
//               <th className="px-4 py-3 text-left">ID</th>
//               <th className="px-4 py-3 text-left">Laundry Name</th>
//               <th className="px-4 py-3 text-left">Contact Number</th>
//               <th className="px-4 py-3 text-left">No. of Services</th>
//               <th className="px-4 py-3 text-left">View Service</th>
//               <th className="px-4 py-3 text-left">View Laundry Detail</th>
//               <th className="px-4 py-3 text-left">Delete</th>
//             </tr>
//           </thead>
//           <tbody>
//             {rows.map((l) => (
//               <tr key={l.id} className="border-t">
//                 <td className="px-4 py-3">{l.id}</td>
//                 <td className="px-4 py-3">{l.name}</td>
//                 <td className="px-4 py-3">{l.contact_info ?? "-"}</td>
//                 <td className="px-4 py-3">
//                   {typeof l.services_count === "number" ? l.services_count : "-"}
//                 </td>
//                 <td className="px-4 py-3">
//                   <button
//                     className="px-3 py-1 rounded-md bg-blue-600 text-white"
//                     onClick={() =>
//                       router.push(
//                         `/Dashboard/ServiceperiodCode?laundry_id=${l.id}`
//                       )
//                     }
//                   >
//                     View
//                   </button>
//                 </td>
//                 <td className="px-4 py-3">
//                   <button
//                     className="px-3 py-1 rounded-md bg-gray-800 text-white"
//                     onClick={() => {
//                       setActiveLaundry(l);
//                       setOpenDetailDlg(true);
//                     }}
//                   >
//                     View
//                   </button>
//                 </td>
//                 <td className="px-4 py-3">
//                   <IconButton
//                     aria-label="Delete laundry"
//                     onClick={() => {
//                       setSelectedLaundry(l);
//                       setOpenDelete(true);
//                     }}
//                   >
//                     <Trash2 className="w-5 h-5 text-red-600" />
//                   </IconButton>
//                 </td>
//               </tr>
//             ))}

//             {rows.length === 0 && (
//               <tr>
//                 <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
//                   No laundries found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* --- View Laundry Detail modal (uses ?? so 0/“0” won't become "-") --- */}
//       <CustomDialog
//         open={openDetailDlg}
//         onClose={() => setOpenDetailDlg(false)}
//         title={
//           activeLaundry ? `${activeLaundry.name} — Details` : "Laundry Details"
//         }
//       >
//         {activeLaundry ? (
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-2">
//             <Field label="Name" value={activeLaundry.name ?? "-"} />
//             <Field label="Contact" value={activeLaundry.contact_info ?? "-"} />
//             <Field label="Pincode" value={activeLaundry.pincode ?? "-"} />
//             <Field label="Latitude" value={activeLaundry.lat ?? "-"} />
//             <Field label="Longitude" value={activeLaundry.long ?? "-"} />
//             <div className="sm:col-span-2">
//               <Field label="Address" value={activeLaundry.address ?? "-"} />
//             </div>

//             <div className="sm:col-span-2 mt-2 flex items-center gap-3">
//               <Button
//                 className="bg-emerald-600 hover:bg-emerald-700 text-white"
//                 onClick={() => {
//                   // Edit from detail dialog (only place to edit)
//                   setSelectedLaundry(activeLaundry);
//                   setFormData({
//                     name: String(activeLaundry.name ?? ""),
//                     contact_info: String(activeLaundry.contact_info ?? ""),
//                     address: String(activeLaundry.address ?? ""),
//                     pincode: String(activeLaundry.pincode ?? ""),
//                     // Coerce to strings so MUI TextField shows values
//                     lat:
//                       activeLaundry.lat !== undefined &&
//                       activeLaundry.lat !== null
//                         ? String(activeLaundry.lat)
//                         : "",
//                     long:
//                       activeLaundry.long !== undefined &&
//                       activeLaundry.long !== null
//                         ? String(activeLaundry.long)
//                         : "",
//                   });
//                   setErrors({});
//                   setOpenDetailDlg(false);
//                   setOpenEdit(true);
//                 }}
//               >
//                 Edit Laundry
//               </Button>
//             </div>
//           </div>
//         ) : (
//           <p className="p-4">No laundry selected.</p>
//         )}
//       </CustomDialog>

//       {/* --- Add Laundry --- */}
//       <CustomDialog
//         open={openAdd}
//         onClose={() => setOpenAdd(false)}
//         title="Add New Laundry"
//         onSubmit={handleAddSubmit}
//         submitText="Save Laundry"
//       >
//         <LaundryForm
//           formData={formData}
//           errors={errors}
//           setFormData={setFormData}
//         />
//       </CustomDialog>

//       {/* --- Edit Laundry --- */}
//       {/* key forces a fresh mount so the inputs show the selected values reliably */}
//       <CustomDialog
//         key={selectedLaundry ? `edit-${selectedLaundry.id}` : "edit"}
//         open={openEdit}
//         onClose={() => setOpenEdit(false)}
//         title={`Edit Laundry${
//           selectedLaundry ? ` — ${selectedLaundry.name}` : ""
//         }`}
//         onSubmit={handleEditSubmit}
//         submitText="Update Laundry"
//       >
//         <LaundryForm
//           formData={formData}
//           errors={errors}
//           setFormData={setFormData}
//         />
//       </CustomDialog>

//       {/* --- Delete Confirmation --- */}
//       <CustomDialog
//         open={openDelete}
//         onClose={() => setOpenDelete(false)}
//         title="Delete Laundry"
//         onSubmit={handleDeleteSubmit}
//         submitText="Delete"
//         cancelText="Cancel"
//       >
//         <p>
//           Are you sure you want to delete{" "}
//           <span className="font-semibold">
//             {selectedLaundry?.name ?? "this laundry"}
//           </span>
//           ? This action cannot be undone.
//         </p>
//       </CustomDialog>
//     </div>
//   );
// }

// // Display helper: accept simple scalar-ish values and render text
// function Field({
//   label,
//   value,
// }: {
//   label: string;
//   value: string | number | null | undefined;
// }) {
//   const display =
//     value === null || value === undefined || value === ""
//       ? "-"
//       : String(value);
//   return (
//     <div className="text-sm">
//       <div className="text-gray-500">{label}</div>
//       <div className="font-medium break-words">{display}</div>
//     </div>
//   );
// }

// // Reusable form
// function LaundryForm({
//   formData,
//   errors,
//   setFormData,
// }: {
//   formData: LaundryFormState;
//   errors: LaundryFormErrors;
//   setFormData: React.Dispatch<React.SetStateAction<LaundryFormState>>;
// }) {
//   return (
//     <div className="flex flex-col gap-4 mt-2">
//       <TextField
//         label="Name"
//         value={formData.name}
//         onChange={(e) => setFormData((s) => ({ ...s, name: e.target.value }))}
//         error={!!errors.name}
//         helperText={errors.name}
//         fullWidth
//         required
//       />
//       <TextField
//         label="Contact Number"
//         value={formData.contact_info}
//         onChange={(e) =>
//           setFormData((s) => ({ ...s, contact_info: e.target.value }))
//         }
//         error={!!errors.contact_info}
//         helperText={errors.contact_info}
//         fullWidth
//       />
//       <TextField
//         label="Address"
//         value={formData.address}
//         onChange={(e) =>
//           setFormData((s) => ({ ...s, address: e.target.value }))
//         }
//         error={!!errors.address}
//         helperText={errors.address}
//         fullWidth
//         multiline
//         rows={2}
//       />
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         <TextField
//           label="Pincode"
//           value={formData.pincode}
//           onChange={(e) =>
//             setFormData((s) => ({ ...s, pincode: e.target.value }))
//           }
//           error={!!errors.pincode}
//           helperText={errors.pincode}
//           fullWidth
//         />
//         <TextField
//           label="Latitude"
//           value={formData.lat}
//           placeholder="e.g. 18.5204"
//           onChange={(e) => setFormData((s) => ({ ...s, lat: e.target.value }))}
//           error={!!errors.lat}
//           helperText={errors.lat}
//           fullWidth
//         />
//         <TextField
//           label="Longitude"
//           value={formData.long}
//           placeholder="e.g. 73.8567"
//           onChange={(e) =>
//             setFormData((s) => ({ ...s, long: e.target.value }))
//           }
//           error={!!errors.long}
//           helperText={errors.long}
//           fullWidth
//         />
//       </div>
//     </div>
//   );
// }





"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CustomDialog from "@/components/Dialog";
import { useRouter } from "next/navigation";
import { fetchLaundries, BASE_URL } from "@/utils/api";
import axios from "axios";
import { TextField, IconButton } from "@mui/material";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

type Laundry = {
  id: number;
  name: string;
  contact_info?: string | null;
  address?: string | null;
  pincode?: string | null;
  // Allow number|string|null, since APIs may differ; we normalize safely.
  lat?: number | string | null;
  long?: number | string | null;
  services_count?: number;
};

type RawLaundry = {
  id?: number | string;
  name?: string;
  contact_info?: string | null;
  address?: string | null;
  pincode?: string | null;
  services_count?: number;

  // coordinate variants from different APIs
  lat?: number | string | null;
  long?: number | string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  Latitude?: number | string | null;
  Longitude?: number | string | null;
  lng?: number | string | null;

  // allow extra keys without using `any`
  [key: string]: unknown;
};

type LaundryFormState = {
  name: string;
  contact_info: string;
  address: string;
  pincode: string;
  lat: string; // form uses strings
  long: string; // form uses strings
};

type LaundryFormErrors = {
  name?: string;
  contact_info?: string;
  address?: string;
  pincode?: string;
  lat?: string;
  long?: string;
};

export default function LaundryListPage() {
  const router = useRouter();

  const [laundries, setLaundries] = useState<Laundry[]>([]);
  const [loading, setLoading] = useState(true);

  // Detail dialog (contains Edit button)
  const [openDetailDlg, setOpenDetailDlg] = useState(false);
  const [activeLaundry, setActiveLaundry] = useState<Laundry | null>(null);

  // Add/Edit/Delete dialogs
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [selectedLaundry, setSelectedLaundry] = useState<Laundry | null>(null);

  // Form state + errors
  const [formData, setFormData] = useState<LaundryFormState>({
    name: "",
    contact_info: "",
    address: "",
    pincode: "",
    lat: "",
    long: "",
  });
  const [errors, setErrors] = useState<LaundryFormErrors>({});

  const rows = useMemo(() => laundries ?? [], [laundries]);

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem("access_token") || "";
    return token
      ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      : { "Content-Type": "application/json" };
  };

  // Safely coerce any incoming coord value to string|number|null
  const toCoord = (v: unknown): string | number | null => {
    if (v === null || v === undefined) return null;
    if (typeof v === "string" || typeof v === "number") return v;
    // Anything else (e.g., {}), treat as null to avoid '{}' leaking into value props
    return null;
  };

  // Normalize field names from backend so UI always has { lat, long }
  const normalizeLaundryList = useCallback((listRaw: RawLaundry[]): Laundry[] => {
    return (listRaw ?? [])
      .map((r): Laundry | null => {
        const idNum = Number(r.id);
        if (!Number.isFinite(idNum)) return null; // require a valid id

        return {
          id: idNum,
          name: r.name ?? "",
          contact_info: r.contact_info ?? null,
          address: r.address ?? null,
          pincode: r.pincode ?? null,
          lat: toCoord(r.lat ?? r.latitude ?? r.Latitude ?? null),
          long: toCoord(r.long ?? r.lng ?? r.longitude ?? r.Longitude ?? null),
          services_count:
            typeof r.services_count === "number" ? r.services_count : undefined,
        };
      })
      .filter((x): x is Laundry => x !== null);
  }, []);

  const loadLaundries = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token") || "";
      const data: unknown = await fetchLaundries(token);
      const listRaw: RawLaundry[] = Array.isArray(data)
        ? (data as RawLaundry[])
        : ((data as { results?: RawLaundry[] })?.results ?? []);
      const list = normalizeLaundryList(listRaw);
      setLaundries(list);
    } catch (e) {
      // keep console for visibility in development
      console.error("Failed to load laundries:", e);
      setLaundries([]);
    } finally {
      setLoading(false);
    }
  }, [normalizeLaundryList]);

  // Validation
  const validate = (state: LaundryFormState) => {
    const nextErrors: LaundryFormErrors = {};
    if (!state.name?.trim()) nextErrors.name = "Name is required";
    if (state.pincode && !/^\d{4,10}$/.test(state.pincode.trim())) {
      nextErrors.pincode = "Enter a valid pincode (4–10 digits)";
    }
    if (state.lat && Number.isNaN(Number(state.lat)))
      nextErrors.lat = "Latitude must be a number";
    if (state.long && Number.isNaN(Number(state.long)))
      nextErrors.long = "Longitude must be a number";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  // Add
  const handleAddSubmit = async () => {
    if (!validate(formData)) return;
    try {
      await axios.post(
        `${BASE_URL}laundary/`,
        {
          name: formData.name || "",
          contact_info: formData.contact_info || null,
          address: formData.address || null,
          pincode: formData.pincode || null,
          lat: formData.lat || null,
          long: formData.long || null,
        },
        { headers: getAuthHeaders() }
      );
      setOpenAdd(false);
      resetForm();
      await loadLaundries();
    } catch (error) {
      console.error("Error adding laundry:", error);
    }
  };

  // Edit (opened from detail dialog only)
  const handleEditSubmit = async () => {
    if (!selectedLaundry) return;
    if (!validate(formData)) return;
    try {
      await axios.patch(
        `${BASE_URL}laundary/${selectedLaundry.id}/`,
        {
          name: formData.name || "",
          contact_info: formData.contact_info || null,
          address: formData.address || null,
          pincode: formData.pincode || null,
          lat: formData.lat || null,
          long: formData.long || null,
        },
        { headers: getAuthHeaders() }
      );
      setOpenEdit(false);
      setSelectedLaundry(null);
      resetForm();
      await loadLaundries();
    } catch (error) {
      console.error("Error editing laundry:", error);
    }
  };

  // Delete
  const handleDeleteSubmit = async () => {
    if (!selectedLaundry) return;
    try {
      await axios.delete(`${BASE_URL}laundary/${selectedLaundry.id}/`, {
        headers: getAuthHeaders(),
      });
      setOpenDelete(false);
      setSelectedLaundry(null);
      await loadLaundries();
    } catch (error) {
      console.error("Error deleting laundry:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      contact_info: "",
      address: "",
      pincode: "",
      lat: "",
      long: "",
    });
    setErrors({});
  };

  const didFetch = useRef(false);
  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    loadLaundries();
  }, [loadLaundries]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl font-bold">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-end">
        {/* <h1 className="text-xl font-semibold">Laundries</h1> */}
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white mt-3 ml-3"
          size="lg"
          onClick={() => {
            resetForm();
            setOpenAdd(true);
          }}
        >
          Add New Laundry
        </Button>
      </div>

      <div className="overflow-x-auto border rounded-md">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Laundry Name</th>
              <th className="px-4 py-3 text-left">Contact Number</th>
              <th className="px-4 py-3 text-left">No. of Services</th>
              <th className="px-4 py-3 text-left">View Service</th>
              <th className="px-4 py-3 text-left">View Laundry Detail</th>
              <th className="px-4 py-3 text-left">Delete</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id} className="border-t">
                <td className="px-4 py-3">{l.id}</td>
                <td className="px-4 py-3">{l.name}</td>
                <td className="px-4 py-3">{l.contact_info ?? "-"}</td>
                <td className="px-4 py-3">
                  {typeof l.services_count === "number" ? l.services_count : "-"}
                </td>
                <td className="px-4 py-3">
                  <button
                    className="px-3 py-1 rounded-md bg-blue-600 text-white"
                    onClick={() =>
                      router.push(
                        `/Dashboard/ServiceperiodCode?laundry_id=${l.id}`
                      )
                    }
                  >
                    View
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    className="px-3 py-1 rounded-md bg-gray-800 text-white"
                    onClick={() => {
                      setActiveLaundry(l);
                      setOpenDetailDlg(true);
                    }}
                  >
                    View
                  </button>
                </td>
                <td className="px-4 py-3">
                  <IconButton
                    aria-label="Delete laundry"
                    onClick={() => {
                      setSelectedLaundry(l);
                      setOpenDelete(true);
                    }}
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </IconButton>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No laundries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- View Laundry Detail modal (uses ?? so 0/“0” won't become "-") --- */}
      <CustomDialog
        open={openDetailDlg}
        onClose={() => setOpenDetailDlg(false)}
        title={
          activeLaundry ? `${activeLaundry.name} — Details` : "Laundry Details"
        }
      >
        {activeLaundry ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-2">
            <Field label="Name" value={activeLaundry.name ?? "-"} />
            <Field label="Contact" value={activeLaundry.contact_info ?? "-"} />
            <Field label="Pincode" value={activeLaundry.pincode ?? "-"} />
            <Field label="Latitude" value={activeLaundry.lat ?? "-"} />
            <Field label="Longitude" value={activeLaundry.long ?? "-"} />
            <div className="sm:col-span-2">
              <Field label="Address" value={activeLaundry.address ?? "-"} />
            </div>

            <div className="sm:col-span-2 mt-2 flex items-center gap-3">
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => {
                  // Edit from detail dialog (only place to edit)
                  setSelectedLaundry(activeLaundry);
                  setFormData({
                    name: String(activeLaundry.name ?? ""),
                    contact_info: String(activeLaundry.contact_info ?? ""),
                    address: String(activeLaundry.address ?? ""),
                    pincode: String(activeLaundry.pincode ?? ""),
                    // Coerce to strings so MUI TextField shows values
                    lat:
                      activeLaundry.lat !== undefined &&
                        activeLaundry.lat !== null
                        ? String(activeLaundry.lat)
                        : "",
                    long:
                      activeLaundry.long !== undefined &&
                        activeLaundry.long !== null
                        ? String(activeLaundry.long)
                        : "",
                  });
                  setErrors({});
                  setOpenDetailDlg(false);
                  setOpenEdit(true);
                }}
              >
                Edit Laundry
              </Button>
            </div>
          </div>
        ) : (
          <p className="p-4">No laundry selected.</p>
        )}
      </CustomDialog>

      {/* --- Add Laundry --- */}
      <CustomDialog
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        title="Add New Laundry"
        onSubmit={handleAddSubmit}
        submitText="Save Laundry"
      >
        <LaundryForm
          formData={formData}
          errors={errors}
          setFormData={setFormData}
        />
      </CustomDialog>

      {/* --- Edit Laundry --- */}
      {/* key forces a fresh mount so the inputs show the selected values reliably */}
      <CustomDialog
        key={selectedLaundry ? `edit-${selectedLaundry.id}` : "edit"}
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        title={`Edit Laundry${selectedLaundry ? ` — ${selectedLaundry.name}` : ""
          }`}
        onSubmit={handleEditSubmit}
        submitText="Update Laundry"
      >
        <LaundryForm
          formData={formData}
          errors={errors}
          setFormData={setFormData}
        />
      </CustomDialog>

      {/* --- Delete Confirmation --- */}
      <CustomDialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        title="Delete Laundry"
        onSubmit={handleDeleteSubmit}
        submitText="Delete"
        cancelText="Cancel"
      >
        <p>
          Are you sure you want to delete{" "}
          <span className="font-semibold">
            {selectedLaundry?.name ?? "this laundry"}
          </span>
          ? This action cannot be undone.
        </p>
      </CustomDialog>
    </div>
  );
}

// Display helper: accept simple scalar-ish values and render text
function Field({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  const display =
    value === null || value === undefined || value === ""
      ? "-"
      : String(value);
  return (
    <div className="text-sm">
      <div className="text-gray-500">{label}</div>
      <div className="font-medium break-words">{display}</div>
    </div>
  );
}

// Reusable form
function LaundryForm({
  formData,
  errors,
  setFormData,
}: {
  formData: LaundryFormState;
  errors: LaundryFormErrors;
  setFormData: React.Dispatch<React.SetStateAction<LaundryFormState>>;
}) {
  return (
    <div className="flex flex-col gap-4 mt-2">
      <TextField
        label="Name"
        value={formData.name}
        onChange={(e) => setFormData((s) => ({ ...s, name: e.target.value }))}
        error={!!errors.name}
        helperText={errors.name}
        fullWidth
        required
      />
      <TextField
        label="Contact Number"
        value={formData.contact_info}
        onChange={(e) =>
          setFormData((s) => ({ ...s, contact_info: e.target.value }))
        }
        error={!!errors.contact_info}
        helperText={errors.contact_info}
        fullWidth
      />
      <TextField
        label="Address"
        value={formData.address}
        onChange={(e) =>
          setFormData((s) => ({ ...s, address: e.target.value }))
        }
        error={!!errors.address}
        helperText={errors.address}
        fullWidth
        multiline
        rows={2}
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <TextField
          label="Pincode"
          value={formData.pincode}
          onChange={(e) =>
            setFormData((s) => ({ ...s, pincode: e.target.value }))
          }
          error={!!errors.pincode}
          helperText={errors.pincode}
          fullWidth
        />
        <TextField
          label="Latitude"
          value={formData.lat}
          placeholder="e.g. 18.5204"
          onChange={(e) => setFormData((s) => ({ ...s, lat: e.target.value }))}
          error={!!errors.lat}
          helperText={errors.lat}
          fullWidth
        />
        <TextField
          label="Longitude"
          value={formData.long}
          placeholder="e.g. 73.8567"
          onChange={(e) =>
            setFormData((s) => ({ ...s, long: e.target.value }))
          }
          error={!!errors.long}
          helperText={errors.long}
          fullWidth
        />
      </div>
    </div>
  );
}
