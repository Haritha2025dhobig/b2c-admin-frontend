"use client";

import React, { useEffect, useState } from "react";
import CommonTable from "@/components/Table";
import { BASE_URL } from "@/utils/api";
import axios from "axios";

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(`${BASE_URL}addresses/`);

      
        console.log("Fetched services:", response.data);
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.results || [];

        setServices(data);
      } catch (error) {
        console.error("Error fetching services:", error);
        setServices([]); // fallback to empty array
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) return <p>Loading...</p>;

  return <CommonTable data={services} />;
}
