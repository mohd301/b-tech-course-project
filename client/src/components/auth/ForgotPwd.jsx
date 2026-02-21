import { Link } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { useForm } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup";
import SchemaForgotPwd from "../../validations/SchemaForgotPwd"
import SchemaEmail from "../../validations/SchemaEmail"

import { sendOtpThunk } from "../../slices/SliceUser"
import { userForgotPwdThunk } from "../../slices/SliceUser"
import { checkAuth } from "../../functions/checkAuth"

import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Skeleton } from "../ui/skeleton"
import OtpModal from "./OtpModal.jsx"

export default function ForgotPwd() {
    const [modalOpen, setModalOpen] = useState(false);
    const handleModalToggle = () => { setModalOpen(!modalOpen) };

    const msg = useSelector((state) => state.user.msg)
    const loading = useSelector((state) => state.user.loading)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const alertedRef = useRef(false);

    const schemaToUse = msg !== "OTP verified!" ? SchemaEmail : SchemaForgotPwd;

    const { register, handleSubmit, formState: { errors }, watch } = useForm({
        resolver: yupResolver(schemaToUse)
    })

    useEffect(() => {
        if (msg === "OTP verified!") {
            setModalOpen(false);
        }
    }, [msg]);

    useEffect(() => {
        checkAuth(alertedRef, navigate)
    }, [navigate]);

    const handleForgotPwd = async (data) => {
        try {
            const res = await dispatch(sendOtpThunk({ Email: data.Email, use: "Pwd" })).unwrap()
            const serverMsg = res.serverMsg
            if (serverMsg === "OTP sent!") {
                setModalOpen(true)
            } else {
                toast.error(serverMsg)
            }
        } catch (err) {
            console.log(err)
        }
    }

    const handleChgPwd = async (data) => {
        try {
            data.Email = watch("Email")
            console.log(data)
            const res = await dispatch(userForgotPwdThunk(data)).unwrap()
            const serverMsg = res.serverMsg
            if (serverMsg === "Password changed successfully!") {
                toast.success(serverMsg)
                navigate("/");
            } else {
                toast.error(serverMsg)
            }
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <div className="w-full max-w-md">
            <div className="w-full">
                <Card className="border-0 shadow-lg">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-center font-bold">Forgot Password</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={msg !== "OTP verified!" ? handleSubmit(handleForgotPwd) : handleSubmit(handleChgPwd)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="eg@email.com"
                                    disabled={msg === "OTP verified!"}
                                    {...register('Email')}
                                />
                                {errors.Email && (
                                    <p className="text-sm text-destructive mt-1">{errors.Email.message}</p>
                                )}
                            </div>

                            {
                                msg === "OTP verified!" && (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="newPassword">New Password</Label>
                                            <Input
                                                id="newPassword"
                                                type="password"
                                                {...register("newPassword")}
                                            />
                                            {errors.newPassword && (
                                                <p className="text-sm text-destructive mt-1">{errors.newPassword.message}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                {...register("confpwd")}
                                            />
                                            {errors.confpwd && (
                                                <p className="text-sm text-destructive mt-1">{errors.confpwd.message}</p>
                                            )}
                                        </div>
                                    </>
                                )
                            }

                            <div className="space-y-3 pt-4">
                                <Link to="/" className="text-sm text-primary hover:underline block">
                                    Back to Login
                                </Link>
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? <Skeleton className="h-5 w-20" /> : (msg !== "OTP verified!" ? "Forgot Password" : "Change Password")}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* OTP Modal */}
            <OtpModal
                isOpen={modalOpen}
                toggle={handleModalToggle}
                Email={watch("Email")}
            />
        </div>
    )
}
