import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import SchemaForgotPwd from "../../validations/SchemaForgotPwd";
import SchemaEmail from "../../validations/SchemaEmail";

import { sendOtpThunk } from "../../slices/SliceUser";
import { userForgotPwdThunk } from "../../slices/SliceUser";
import { checkAuth } from "../../functions/checkAuth";
import { useTheme } from "../../compsMisc/ThemeContext";

import PasswordInput from "./PasswordInput";
import OtpModal from "./OtpModal";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { FormMessage } from "../ui/form";
import { Skeleton } from "../ui/skeleton";

export default function ForgotPwd() {
  const { theme } = useTheme();

  const [modalOpen, setModalOpen] = useState(false);
  const handleModalToggle = () => { setModalOpen(!modalOpen); };

  const msg = useSelector((state) => state.user.msg);
  const loading = useSelector((state) => state.user.loading);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const alertedRef = useRef(false);

  const schemaToUse = msg !== "OTP verified!" ? SchemaEmail : SchemaForgotPwd;

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: yupResolver(schemaToUse)
  });

  useEffect(() => {
    if (msg === "OTP verified!") {
      setModalOpen(false);
    }
  }, [msg]);

  useEffect(() => {
    checkAuth(alertedRef, navigate);
  }, [navigate]);

  const handleForgotPwd = async (data) => {
    try {
      const res = await dispatch(sendOtpThunk({ Email: data.Email, use: "Pwd" })).unwrap();
      const serverMsg = res.serverMsg;
      if (serverMsg === "OTP sent!") {
        setModalOpen(true);
      } else {
        toast.error(serverMsg);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleChgPwd = async (data) => {
    try {
      data.Email = watch("Email");
      console.log(data);
      const res = await dispatch(userForgotPwdThunk(data)).unwrap();
      const serverMsg = res.serverMsg;
      if (serverMsg === "Password changed successfully!") {
        toast.success(serverMsg);
        navigate("/");
      } else {
        toast.error(serverMsg);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-background py-8"
      style={{ backgroundColor: theme.primaryBackground, minHeight: "80vh" }}
    >
      <Card 
        className="w-full max-w-lg"
        style={{ background: theme.tertiaryColor }}
      >
        <CardHeader>
          <CardTitle className="text-center text-2xl" style={{ color: "white" }}>
            Forgot Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!loading ? (
            <form 
              onSubmit={msg !== "OTP verified!" ? handleSubmit(handleForgotPwd) : handleSubmit(handleChgPwd)}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email:</Label>
                <Input
                  id="email"
                  placeholder="eg@email.com"
                  disabled={msg === "OTP verified!"}
                  {...register('Email')}
                  className="w-full"
                />
                <FormMessage className="text-sm text-red-500">
                  {errors.Email?.message}
                </FormMessage>
              </div>

              {msg === "OTP verified!" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-white">New Password:</Label>
                    <PasswordInput register={register} name={"newPassword"} placeholder="Enter new password" />
                    <FormMessage className="text-sm text-red-500">
                      {errors.newPassword?.message}
                    </FormMessage>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confpwd" className="text-white">Confirm New Password:</Label>
                    <PasswordInput register={register} name={"confpwd"} placeholder="Confirm new password" />
                    <FormMessage className="text-sm text-red-500">
                      {errors.confpwd?.message}
                    </FormMessage>
                  </div>
                </>
              )}

              <div className="flex flex-col gap-2 w-full max-w-xs">
                <Link to="/" className="text-sm text-white hover:text-gray-200">
                  Login
                </Link>
              </div>

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  className="w-full md:w-auto"
                  style={{ background: theme.primaryColor }}
                >
                  {msg !== "OTP verified!" ? "Forgot Password" : "Change Password"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-center p-8">
              <Skeleton className="h-8 w-32" />
            </div>
          )}
        </CardContent>
      </Card>

      <OtpModal
        isOpen={modalOpen}
        toggle={handleModalToggle}
        Email={watch("Email")}
      />
    </div>
  );
}
