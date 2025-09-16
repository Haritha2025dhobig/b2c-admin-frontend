import axios from "axios";

// export const BASE_URL = "https://dgb2cbackend-production.up.railway.app/";
export const BASE_URL = "http://127.0.0.1:8000/";

const API = axios.create({
  baseURL: BASE_URL,
});

// ✅ Utility to extract error message safely
const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.message ||
      "Unexpected error occurred"
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown error";
};

// -------------------- OTP --------------------

export const sendOtpRequest = async (
  mobile_number: string,
  setShowRequestError: (msg: string) => void
): Promise<boolean> => {
  try {
    const response = await axios.post("https://sso.dhobig.com/api/sso/login/send-otp/", { mobile_number });
    console.log("OTP request response:", response.data);

    if (response.status === 200) {
      return true;
    } else {
      setShowRequestError(response.data.message || "OTP request failed");
      return false;
    }
  } catch (error: unknown) {
    const msg = getErrorMessage(error);
    console.error("Error sending OTP:", msg);
    setShowRequestError(msg);
    return false;
  }
};

export const verifyOtpRequest = async (
  mobile_number: string,
  otp: string,
  setShowError: (msg: string) => void
): Promise<boolean> => {
  try {
    const response = await axios.post("https://sso.dhobig.com/api/sso/login/verify-otp/", {
      mobile_number,
      otp,
    });
    console.log("OTP verification response:", response.data);

    if (response.status === 200) {
      localStorage.setItem("access_token", response.data.tokens.access);
      localStorage.setItem("refresh_token", response.data.tokens.refresh);
      return true;
    } else {
      setShowError(response.data.message || "OTP verification failed");
      return false;
    }
  } catch (error: unknown) {
    let errorMsg = "Verification failed";

    if (axios.isAxiosError(error)) {
      errorMsg =
        (error.response?.data as { error?: string[] })?.error?.[0] ||
        error.message ||
        errorMsg;
    }

    console.error("Error verifying OTP:", errorMsg);
    setShowError(errorMsg);
    return false;
  }
};

// -------------------- Laundry APIs --------------------

export const fetchLaundries = async (token: string) => {
  try {
    const response = await API.get("/laundary/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Request headers:", response.config.headers);
    return response.data;
  } catch (error: unknown) {
    const msg = getErrorMessage(error);
    console.error("Error fetching laundries:", msg);

    if (axios.isAxiosError(error)) {
      throw error.response?.data || { message: msg };
    }
    throw { message: msg };
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

export const createLaundry = async (
  laundryData: LaundryPayload,
  token: string
) => {
  try {
    const response = await API.post("/laundary/", laundryData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Laundry created:", response.data);
    return response.data;
  } catch (error: unknown) {
    const msg = getErrorMessage(error);
    console.error("Error creating laundry:", msg);

    if (axios.isAxiosError(error)) {
      throw error.response?.data || { message: msg };
    }
    throw { message: msg };
  }
};
