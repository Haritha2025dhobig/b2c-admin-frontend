// "use client";

// import React, { useEffect, useState } from "react";
// import CommonTable from "@/components/Table";
// import { BASE_URL } from "@/utils/api";
// import axios from "axios";

// export interface PendingOrder {
//   id: number;
//   sso_uuid?: string;
//   pickup_date_time?: string;
//   total_amount?: number;
//   name?: string;
//   mobile_no?: string;
//   full_address?: string;
//   order_created_at?: string;
//   payment_status?: string;
//   order_status?: string | { id: number; status: string };
// }

// export default function PendingOrdersPage() {
//   const [orders, setOrders] = useState<PendingOrder[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         const token = localStorage.getItem("access_token");
//         if (!token) {
//           console.error("No token found in localStorage");
//           setOrders([]);
//           setLoading(false);
//           return;
//         }

//         const response = await axios.get<PendingOrder[] | { results: PendingOrder[] }>(
//           `${BASE_URL}pending-orders/`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );

//         const data = Array.isArray(response.data)
//           ? response.data
//           : response.data.results || [];

//         setOrders(data);
//       } catch (error) {
//         console.error("Error fetching pending orders:", error);
//         setOrders([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrders();
//   }, []);

// //     if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <p className="text-xl font-bold">Loading...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* <div className="flex items-center justify-between">
//         <h1 className="text-xl font-semibold ml-2 mt-2">Pending Orders</h1>
//       </div> */}
//       <CommonTable data={orders} fitColumnsToContent  />
//     </div>


//   );
// }


// "use client";

// import React, { useEffect, useState } from "react";
// import CommonTable from "@/components/Table";
// import { BASE_URL } from "@/utils/api";
// import axios from "axios";

// export interface PendingOrder {
//   id: number;
//   sso_uuid?: string;
//   address?: number | { id: number } | null;
//   pickup_date_time?: string;
//   total_amount?: number;
//   name?: string;
//   mobile_no?: string;
//   full_address?: string;
//   order_created_at?: string;
//   payment_status?: string;
//   order_status?: string | { id: number; status: string };
// }

// // ---------- helpers (added) ----------
// const getAuthHeaders = () => {
//   const token = localStorage.getItem("access_token");
//   return token ? { Authorization: `Bearer ${token}` } : {};
// };

// const extractId = (val: unknown): number | null => {
//   if (typeof val === "number") return val;
//   if (typeof val === "string") return Number(val) || null;
//   if (val && typeof val === "object" && "id" in (val as any)) {
//     const n = Number((val as any).id);
//     return Number.isFinite(n) ? n : null;
//   }
//   return null;
// };

// // supports {lat,long} or {latitude,longitude}/{lng}
// const pickLatLng = (obj: any): { lat: number; long: number } | null => {
//   if (!obj) return null;
//   const latRaw = obj.lat ?? obj.latitude;
//   const lngRaw = obj.long ?? obj.lng ?? obj.longitude;
//   const lat = Number(latRaw);
//   const long = Number(lngRaw);
//   if (Number.isFinite(lat) && Number.isFinite(long)) return { lat, long };
//   return null;
// };

// const openInMaps = (lat: number, long: number) => {
//   window.open(`https://www.google.com/maps?q=${lat},${long}`, "_blank", "noopener,noreferrer");
// };

// const fetchAddressById = async (addressId: number) => {
//   const r = await axios.get(`${BASE_URL}addresses/${addressId}/`, { headers: getAuthHeaders() });
//   return r.data;
// };
// // ------------------------------------

// export default function PendingOrdersPage() {
//   const [orders, setOrders] = useState<PendingOrder[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         const token = localStorage.getItem("access_token");
//         if (!token) {
//           console.error("No token found in localStorage");
//           setOrders([]);
//           setLoading(false);
//           return;
//         }

//         const response = await axios.get<PendingOrder[] | { results: PendingOrder[] }>(
//           `${BASE_URL}pending-orders/`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );

//         const data = Array.isArray(response.data)
//           ? response.data
//           : response.data.results || [];

//         setOrders(data);
//       } catch (error) {
//         console.error("Error fetching pending orders:", error);
//         setOrders([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrders();
//   }, []);

//   // click handler for the button (added)
//   const handleViewLocation = async (row: PendingOrder) => {
//     try {
//       const addrId = extractId(row.address);
//       if (!addrId) {
//         alert("No address ID found for this order.");
//         return;
//       }
//       const addressObj = await fetchAddressById(addrId);
//       const ll = pickLatLng(addressObj);
//       if (!ll) {
//         alert("Latitude/Longitude not found for this address.");
//         return;
//       }
//       openInMaps(ll.lat, ll.long);
//     } catch (e) {
//       console.error(e);
//       alert("Unable to open location. Please try again.");
//     }
//   };

//     if (loading) {
//   return (
//     <div className="flex items-center justify-center h-screen">
//       <p className="text-xl font-bold">Loading...</p>
//     </div>
//   );
// }

//   return (
//     <div className="space-y-6">
//       <CommonTable
//         data={orders}
//         fitColumnsToContent
//         // ⬇️ add one column for the button; keep others inferred automatically
//         columns={[
//           ...Object.keys(orders[0] ?? {}).map((k) => ({ key: k })),
//           {
//             key: "view_location",
//             header: "View Location",
//             render: (row) => (
//               <button
//                 onClick={() => handleViewLocation(row as PendingOrder)}
//                 className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm hover:bg-blue-700"
//               >
//                 View
//               </button>
//             ),
//             sx: { minWidth: 140 },
//           },
//         ]}
//       />
//     </div>
//   );
// }




"use client";

import React, { useEffect, useState } from "react";
import CommonTable from "@/components/Table";
import { BASE_URL } from "@/utils/api";
import axios from "axios";

export interface PendingOrder {
  id: number;
  sso_uuid?: string;
  address?: number | { id: number } | null;
  pickup_date_time?: string;
  total_amount?: number;
  name?: string;
  mobile_no?: string;
  full_address?: string;
  order_created_at?: string;
  payment_status?: string;
  order_status?: string | { id: number; status: string };
}

/* ------------------------------ helpers ----------------------------------- */
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const extractId = (val: unknown): number | null => {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const n = Number(val);
    return Number.isFinite(n) ? n : null;
  }
  if (typeof val === "object" && val !== null && "id" in (val as Record<string, unknown>)) {
    const n = Number((val as { id: unknown }).id);
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

const pickLatLng = (obj: unknown): { lat: number; long: number } | null => {
  if (typeof obj !== "object" || obj === null) return null;
  const rec = obj as Record<string, unknown>;
  const latRaw = rec.lat ?? rec.latitude;
  const lngRaw = rec.long ?? rec.lng ?? rec.longitude;

  const lat = typeof latRaw === "string" ? Number(latRaw) : (latRaw as number | undefined);
  const long = typeof lngRaw === "string" ? Number(lngRaw) : (lngRaw as number | undefined);

  if (typeof lat === "number" && Number.isFinite(lat) && typeof long === "number" && Number.isFinite(long)) {
    return { lat, long };
  }
  return null;
};

const openInMaps = (lat: number, long: number) => {
  window.open(`https://www.google.com/maps?q=${lat},${long}`, "_blank", "noopener,noreferrer");
};

const fetchAddressById = async (addressId: number): Promise<unknown> => {
  const r = await axios.get(`${BASE_URL}addresses/${addressId}/`, { headers: getAuthHeaders() });
  return r.data;
};
/* -------------------------------------------------------------------------- */

export default function PendingOrdersPage() {
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          // eslint-disable-next-line no-console
          console.error("No token found in localStorage");
          setOrders([]);
          setLoading(false);
          return;
        }

        const response = await axios.get<PendingOrder[] | { results: PendingOrder[] }>(
          `${BASE_URL}pending-orders/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = Array.isArray(response.data)
          ? response.data
          : response.data.results || [];

        setOrders(data);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error fetching pending orders:", error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // click handler for the button (added)
  const handleViewLocation = async (row: PendingOrder) => {
    try {
      const addrId = extractId(row.address);
      if (!addrId) {
        // eslint-disable-next-line no-alert
        alert("No address ID found for this order.");
        return;
      }
      const addressObj = await fetchAddressById(addrId);
      const ll = pickLatLng(addressObj);
      if (!ll) {
        // eslint-disable-next-line no-alert
        alert("Latitude/Longitude not found for this address.");
        return;
      }
      openInMaps(ll.lat, ll.long);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      // eslint-disable-next-line no-alert
      alert("Unable to open location. Please try again.");
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
      <CommonTable<PendingOrder>
        data={orders}
        fitColumnsToContent
        columns={[
          ...Object.keys(orders[0] ?? {}).map((k) => ({ key: k })),
          {
            key: "view_location",
            header: "View Location",
            render: (row) => (
              <button
                onClick={() => handleViewLocation(row as PendingOrder)}
                className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm hover:bg-blue-700"
              >
                View
              </button>
            ),
            sx: { minWidth: 140 },
          },
        ]}
      />
    </div>
  );
}
