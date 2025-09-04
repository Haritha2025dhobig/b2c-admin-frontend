"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ListAltIcon from "@mui/icons-material/ListAlt";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PinDropIcon from "@mui/icons-material/PinDrop";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import DepartureBoardIcon from '@mui/icons-material/DepartureBoard';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';



export default function Sidebar() {
  const pathname = usePathname();

  // Helper to style active link
  const linkClasses = (href: string) =>
    `flex items-center gap-2 p-2 rounded-lg transition ${
      pathname === href
        ? "bg-blue-600 text-white font-semibold"
        : "hover:bg-gray-100 text-gray-700"
    }`;

  return (
    <aside className="w-64 bg-white border-r h-screen p-4 flex flex-col">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">Dhobi G</h1>

      <nav className="flex flex-col gap-2">
        <Link href="/" className={linkClasses("/")}>
          <DashboardCustomizeIcon fontSize="small" /> Dashboard
        </Link>

        <Link href="/Dashboard/Services" className={linkClasses("/Dashboard/Services")}>
          <Inventory2Icon fontSize="small" /> Services
        </Link>

        <Link href="/Dashboard/ServicePeriod" className={linkClasses("/Dashboard/ServicePeriod")}>
          <ListAltIcon fontSize="small" /> ServicePeriod
        </Link>

        <Link href="/Dashboard/Pincode" className={linkClasses("/Dashboard/Pincode")}>
          <PinDropIcon fontSize="small" /> ServicePincode
        </Link>

        <Link href="/Dashboard/address" className={linkClasses("/Dashboard/address")}>
          <LocationOnIcon fontSize="small" /> User-Address
        </Link>

        {/* <Link href="/Dashboard/ServiceperiodCode" className={linkClasses("/Dashboard/ServiceperiodCode")}>
          <DashboardIcon fontSize="small" /> ServiceDeliveryCode
        </Link> */}

        <Link href="/Dashboard/pendingorders" className={linkClasses("/Dashboard/pendingorders")}>
          <PendingActionsIcon fontSize="small" /> Pending-orders
        </Link>

        <Link href="/Dashboard/Confirmorders" className={linkClasses("/Dashboard/Confirmorders")}>
          <CheckCircleIcon fontSize="small" /> Confirmed-orders
        </Link>

        <Link href="/Dashboard/pickuptype" className={linkClasses("/Dashboard/pickuptype")}>
          <DepartureBoardIcon fontSize="small" /> Pickup Type
        </Link>
        <Link href="/Dashboard/Pricetype" className={linkClasses("/Dashboard/Pricetype")}>
          <CurrencyRupeeIcon fontSize="small" /> Price Type
        </Link>
        <Link href="/Dashboard/Laundary" className={linkClasses("/Dashboard/Laundary")}>
          <LocalLaundryServiceIcon fontSize="small" /> Laundary
        </Link>
      </nav>
    </aside>
  );
}
