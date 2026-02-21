import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { addUserThunk } from "../../slices/SliceUser";
import { sendOtpThunk } from "../../slices/SliceUser";
import { clearMsg } from "../../slices/SliceUser";
import { checkAuth } from "../../functions/checkAuth";
import { useTheme } from "../../compsMisc/ThemeContext";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import SchemaReg from "../../validations/SchemaReg";

import OtpModal from "./OtpModal";
import PasswordInput from "./PasswordInput";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { FormMessage } from "../ui/form";
import { Skeleton } from "../ui/skeleton";

export default function Register() {
  const { theme } = useTheme();

  const [modalOpen, setModalOpen] = useState(false);

  const msg = useSelector((state) => state.user.msg);
  const loading = useSelector((state) => state.user.loading);
  const regUserDispatch = useDispatch();
  const navigate = useNavigate();
  const alertedRef = useRef(false);

  const { register, handleSubmit, getValues, watch, formState: { errors } } = useForm({
    resolver: yupResolver(SchemaReg)
  });

  const formValues = getValues();

  useEffect(() => {
    if (msg === "OTP verified!") {
      regUserDispatch(addUserThunk(formValues));
      setModalOpen(false);
    }

    if (msg === "Registration Success!") {
      toast.success(msg);
      regUserDispatch(clearMsg());
      navigate("/");
    }
  }, [msg, regUserDispatch, navigate]);

  useEffect(() => {
    checkAuth(alertedRef, navigate);
  }, [navigate]);

  const handleModalToggle = () => { setModalOpen(!modalOpen); };

  const handleRegister = async (data) => {
    try {
      const res = await regUserDispatch(sendOtpThunk({ Email: data.Email, use: "Reg" })).unwrap();
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
            Register
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!loading ? (
            <form onSubmit={handleSubmit(handleRegister)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  placeholder="eg@email.com"
                  {...register('Email')}
                  className="w-full"
                />
                <FormMessage className="text-sm text-red-500">
                  {errors.Email?.message}
                </FormMessage>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="9xxx-xxxx"
                  {...register('Phone')}
                  className="w-full"
                />
                <FormMessage className="text-sm text-red-500">
                  {errors.Phone?.message}
                </FormMessage>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <PasswordInput register={register} name={'Password'} placeholder="Enter password" />
                <FormMessage className="text-sm text-red-500">
                  {errors.Password?.message}
                </FormMessage>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confpwd" className="text-white">Confirm Password</Label>
                <PasswordInput register={register} name={'confpwd'} placeholder="Confirm password" />
                <FormMessage className="text-sm text-red-500">
                  {errors.confpwd?.message}
                </FormMessage>
              </div>

              <div className="flex flex-col gap-2 w-full max-w-xs">
                <Link to="/" className="text-sm text-white hover:text-gray-200">
                  Back to Login
                </Link>
              </div>

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  className="w-full md:w-auto"
                  style={{ background: theme.primaryColor }}
                >
                  Register
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
