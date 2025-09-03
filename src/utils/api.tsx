import axios from "axios";

export const BASE_URL = "http://localhost:8000/"

const API = axios.create({
  baseURL: "http://localhost:8000/", // change to your backend URL
  // headers: {
  //   "Content-Type": "application/json",
  // },
});

// Correct type: (msg: string) => void
export const sendOtpRequest = async (
  mobile_number: string,
  setShowRequestError: (msg: string) => void
): Promise<boolean> => {
  try {
    const response = await axios.post(
      "https://sso.dhobig.com/api/sso/login/send-otp/",
      { mobile_number }
    );
    console.log("OTP request response:", response.data);
    if (response.status === 200) {
      return true;
    } else {
      setShowRequestError(response.data.message || "OTP request failed");
      return false;
    }
  } catch (error: any) {
    console.log("Error sending OTP:", error);
    setShowRequestError(error.message || "Network error");
    return false;
  }
};



export const verifyOtpRequest = async (
  mobile_number: string,
  otp: string,
  setShowError: (msg: string) => void
): Promise<boolean> => {
  try {
    const response = await axios.post(
      "https://sso.dhobig.com/api/sso/login/verify-otp/",
      {
        mobile_number,
        otp,
      }
    );
    console.log("OTP verification response:", response.data);
    if (response.status === 200) {
      localStorage.setItem("access_token", response.data.tokens.access);
      localStorage.setItem("refresh_token", response.data.tokens.refresh);
      return true;
    } else {
      setShowError(response.data.message || "OTP verification failed");
      return false;
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.error?.[0] || "Verification failed";
    console.log("Error verifying OTP:", errorMsg);
    setShowError(errorMsg);
    return false;
  }
};



export const fetchLaundries = async (token: string) => {
  try {
    const response = await API.get("/laundary/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Request headers:", response.config.headers);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching laundries:", error);
    throw error.response?.data || { message: "Failed to fetch laundries" };
  }
};



type LaundryPayload = {
  name: string;
  contact_info?: string;
  address?: string;
  pincode?: string;
  lat?: string;
  long?: string;
};

export const createLaundry = async (laundryData: LaundryPayload, token: string) => {
  try {
    const response = await API.post("/laundary/", laundryData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Laundry created:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error creating laundry:", error);
    throw error.response?.data || { message: "Failed to create laundry" };
  }
};
