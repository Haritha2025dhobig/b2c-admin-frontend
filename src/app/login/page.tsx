"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import { jwtDecode } from "jwt-decode";


const Loginpage = () => {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
      

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("access");
        if (token) {
          const decoded: any = jwtDecode(token);
            router.replace("home/");
          
          
        } else {
          setAuthChecked(true); // Allow login if no token
        }
      } catch (error) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        setAuthChecked(true); // Allow login on error
      }
    };

    checkAuth();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await axios.post("http://192.168.0.34:8000/api/token/", {
        username,
        password,
      });

      const accessToken = response.data.access;
      const refreshToken = response.data.refresh;

      interface DecodedToken {
        roles?: string[];
        [key: string]: any;
        is_superuser?: boolean;
        is_admin?:boolean;
      }
      const decoded: DecodedToken = jwtDecode(accessToken);
      const userRoles = decoded.roles || [];
      const is_Admin = decoded.is_admin || false;
      const is_superuser = decoded.is_superuser || false;

      if(decoded.is_superuser){
        router.replace("/home");
      }
      if(decoded.is_admin){
        router.replace("/home");
      }

      else if (userRoles.length === 0) {
        setError("No roles found in token.");
        return;
      }

      localStorage.setItem("access", accessToken);
      localStorage.setItem("refresh", refreshToken);
      localStorage.setItem("isAdmin",String(is_Admin))
      localStorage.setItem("isSuperuser",String(is_superuser))

      router.replace("/home");
    } catch (err: any) {
      if (err.response?.data?.detail) {
        alert(err.response.data.detail);
        // setError(err.response.data.detail);
      } else {
        alert("An unexpected error occurred.");
      }
    }
  };

  if (!authChecked) {
    return null;
  }

  return (
    <div className="w-full h-screen flex bg-[url('/background.png')] bg-cover bg-center bg-repeat relative">
      <img
        src="/backgroundimg.png"
        alt="Laundry Detergent"
        className="absolute top-0 left-[773px] w-[1131px] h-screen object-cover"
      />

      <div className="absolute top-[170px] ml-30 w-[1372px] h-[710px] relative">
        <div className="absolute top-0 left-0 w-[464px] h-[710px] bg-white rounded-r-[22px] rotate-180"></div>

        <div className="absolute top-[50px] ml-[55px] text-[#007bb6] font-roboto font-extrabold text-[32px]">
          Inventory
        </div>

        <div className="absolute top-[113px] ml-[55px] text-black font-inter font-semibold text-[36px]">
          Sign in
        </div>

        <form onSubmit={handleLogin}>
          <div className="absolute top-[180px] left-[55px] text-black font-inter font-semibold text-[20px]">
            User name
          </div>

          <div className="absolute top-[220px] left-[55px] w-[334px]">
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError(null);
              }}
              onBlur={() => setUsernameTouched(true)}
              placeholder="Enter your User name"
              className="w-full h-[69px] px-4 text-[20px] text-[#5f5555] font-inter border-gray-400 rounded border outline-none focus:border-2 focus:border-blue-600 hover:border-black"
            />
            {usernameTouched && username.trim() === "" && (
              <p className="text-red-600 text-sm mt-1">
                *This field is required.
              </p>
            )}
          </div>

          <div className="absolute top-[320px] left-[55px] text-black font-inter font-semibold text-[20px]">
            Password
          </div>

          <div className="absolute top-[360px] left-[55px] w-[334px]">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setPasswordTouched(true)}
              placeholder="Enter your Password"
              className="w-full h-[69px] px-4 text-[20px] text-[#5f5555] font-inter border border-gray-400 rounded outline-none focus:border-blue-600 hover:border-black"
            />
            {passwordTouched && password.trim() === "" && (
              <p className="text-red-600 text-sm mt-1">
                *This field is required.
              </p>
            )}

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-[35px] transform -translate-y-1/2 text-gray-600 focus:outline-none"
            >
              {showPassword ? (
                <VisibilityRoundedIcon />
              ) : (
                <VisibilityOffRoundedIcon />
              )}
            </button>
          </div>

          {error && (
            <div className="absolute top-[490px] ml-[55px] w-[334px] text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="absolute top-[530px] ml-[55px] w-[334px]">
            <button
              type="submit"
              className="w-full h-[65px] bg-[#267ddf] text-white text-[20px] font-inter font-semibold rounded"
            >
              Sign In
            </button>
          </div>
        </form>

        <div className="absolute top-[460px] left-[55px]">
          <a
            href="/Profileverification"
            className="text-[#267ddf] font-inter font-semibold text-[20px] no-underline"
          >
            Forget Password?
          </a>
        </div>

        <div className="absolute top-[635px] left-[83px] font-inter font-semibold text-[20px]">
          <span className="text-[#736969]">Don't have account?</span>{" "}
          <Link
            href="/signup"
            className="text-[#1c65b9] font-semibold no-underline"
          >
            Sign up
          </Link>
        </div>

        <div className="absolute top-0 left-[463px] w-[895px] h-[710px] bg-white rounded-r-[22px]">
          <div className="relative h-full">
            <div className="absolute top-[116px] left-[36px] text-[#3a4b53] font-jakarta font-semibold text-[48px] leading-none">
              Welcome Back!
            </div>

            <div className="absolute top-[189px] left-[35px] max-w-[664px] text-[#007bb5] font-jakarta font-semibold text-[48px] leading-[48px]">
              Inventory management system for Laundry industry
            </div>

            <div
              className="absolute top-[336px] left-[34px] max-w-[829px] text-[#1e1e1e] text-[30px] leading-[48px] font-jakarta"
              style={{ WebkitTextStroke: "1px #00000036" }}
            >
              Manage your laundry services with ease.
              <br />
              Track inventory, monitor usage, and streamline operations.
            </div>

            <div className="absolute top-[474px] left-[36px] text-black text-[28px] leading-[40px] font-jakarta">
              Powered by
            </div>

            <img
              src="/logo.png"
              alt="Company Logo"
              className="absolute top-[538px] left-[36px] w-[439px] h-[128px] object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loginpage;