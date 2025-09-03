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
//   if (loading) return <p>Loading...</p>;

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



"use client";

import React, { useEffect, useMemo, useState } from "react";
import CustomDialog from "@/components/Dialog";
import { useRouter } from "next/navigation";
import { fetchLaundries } from "@/utils/api";

type Laundry = {
  id: number;
  name: string;
  contact_info?: string | null;
  address?: string | null;
  pincode?: string | null;
  lat?: string | null;
  long?: string | null;
  services_count?: number;
};

export default function LaundryListPage() {
  const router = useRouter();

  const [laundries, setLaundries] = useState<Laundry[]>([]);
  const [loading, setLoading] = useState(true);

  // Detail dialog only (services now navigate)
  const [openDetailDlg, setOpenDetailDlg] = useState(false);
  const [activeLaundry, setActiveLaundry] = useState<Laundry | null>(null);

  const rows = useMemo(() => laundries ?? [], [laundries]);

  const loadLaundries = async () => {
    try {
      const token = localStorage.getItem("access_token") || "";
      const data = await fetchLaundries(token);
      const list = Array.isArray(data) ? data : data?.results || [];
      setLaundries(list);
    } catch (e) {
      console.error("Failed to load laundries:", e);
      setLaundries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLaundries();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Laundries</h1>
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
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id} className="border-t">
                <td className="px-4 py-3">{l.id}</td>
                <td className="px-4 py-3">{l.name}</td>
                <td className="px-4 py-3">{l.contact_info || "-"}</td>
                <td className="px-4 py-3">
                  {typeof l.services_count === "number" ? l.services_count : "-"}
                </td>
                <td className="px-4 py-3">
                  <button
                    className="px-3 py-1 rounded-md bg-blue-600 text-white"
                    onClick={() => {
                      // 👉 Navigate to the Service Delivery Codes page with laundry filter
                      router.push(`/Dashboard/ServiceperiodCode?laundry_id=${l.id}`);
                    }}
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
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No laundries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- View Laundry Detail modal --- */}
      <CustomDialog
        open={openDetailDlg}
        onClose={() => setOpenDetailDlg(false)}
        title={activeLaundry ? `${activeLaundry.name} — Details` : "Laundry Details"}
      >
        {activeLaundry ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-2">
            <Field label="Name" value={activeLaundry.name} />
            <Field label="Contact" value={activeLaundry.contact_info || "-"} />
            <Field label="Pincode" value={activeLaundry.pincode || "-"} />
            <Field label="Latitude" value={activeLaundry.lat || "-"} />
            <Field label="Longitude" value={activeLaundry.long || "-"} />
            <div className="sm:col-span-2">
              <Field label="Address" value={activeLaundry.address || "-"} />
            </div>
          </div>
        ) : (
          <p className="p-4">No laundry selected.</p>
        )}
      </CustomDialog>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="text-sm">
      <div className="text-gray-500">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

