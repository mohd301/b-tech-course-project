import { Link } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { addUserThunk } from "../../slices/SliceUser"
import { sendOtpThunk } from "../../slices/SliceUser"
import { clearMsg } from "../../slices/SliceUser"
import { checkAuth } from "../../functions/checkAuth"

import { useForm } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup";
import SchemaReg from "../../validations/SchemaReg"

import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Skeleton } from "../ui/skeleton"
import OtpModal from "./OtpModal.jsx"

export default function Register() {
    const [modalOpen, setModalOpen] = useState(false);

    const msg = useSelector((state) => state.user.msg)
    const loading = useSelector((state) => state.user.loading)
    const regUserDispatch = useDispatch()
    const navigate = useNavigate()
    const alertedRef = useRef(false);

    const { register, handleSubmit, getValues, watch, formState: { errors } } = useForm({
        resolver: yupResolver(SchemaReg)
    })

    const formValues = getValues();

    useEffect(() => {
        if (msg === "OTP verified!") {
            regUserDispatch(addUserThunk(formValues));
            setModalOpen(false);
        }

        if (msg === "Registration Success!") {
            toast.success(msg)
            regUserDispatch(clearMsg())
            navigate("/");
        }
    }, [msg, regUserDispatch, navigate]);

    useEffect(() => {
        checkAuth(alertedRef, navigate)
    }, [navigate]);

    const handleModalToggle = () => { setModalOpen(!modalOpen) };

    const handleRegister = async (data) => {
        try {
            const res = await regUserDispatch(sendOtpThunk({ Email: data.Email, use: "Reg" })).unwrap()
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

    return (
        <div className="w-full max-w-md">
            <div className="w-full">
                <Card className="border-0 shadow-lg">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-center font-bold">Register</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(handleRegister)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="eg@email.com"
                                    {...register('Email')}
                                />
                                {errors.Email && (
                                    <p className="text-sm text-destructive mt-1">{errors.Email.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="9xxx-xxxx"
                                    {...register('Phone')}
                                />
                                {errors.Phone && (
                                    <p className="text-sm text-destructive mt-1">{errors.Phone.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    {...register('Password')}
                                />
                                {errors.Password && (
                                    <p className="text-sm text-destructive mt-1">{errors.Password.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    {...register('confpwd')}
                                />
                                {errors.confpwd && (
                                    <p className="text-sm text-destructive mt-1">{errors.confpwd.message}</p>
                                )}
                            </div>

                            <div className="space-y-3 pt-4">
                                <Link to="/" className="text-sm text-primary hover:underline block">
                                    Back to Login
                                </Link>
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? <Skeleton className="h-5 w-20" /> : "Register"}
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
