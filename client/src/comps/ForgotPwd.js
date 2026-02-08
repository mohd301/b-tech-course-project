import { Button, Container, Form, Label, Card, CardBody } from "reactstrap"
import { Link } from "react-router-dom"
import { colors } from "../styles/colors"
import { useState, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"

import { useForm } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup";
import SchemaForgotPwd from "../validations/SchemaForgotPwd"
import SchemaEmail from "../validations/SchemaEmail"

import { alertAuth } from "../functions/alertAuth"
import { sendOtpThunk } from "../slices/SliceUser"
import { userForgotPwdThunk } from "../slices/SliceUser"

import PasswordInput from "../compsMisc/PasswordInput"
import OtpModal from "./OtpModal"
import CenteredSpinner from "../compsMisc/CentredSpinner"

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
        const localToken = localStorage.getItem("authToken");
        if (localToken && !alertedRef.current) {
            alertedRef.current = true;
            alertAuth(navigate);
        }
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
        <div style={{ background: colors.primaryBackground, minHeight: "80vh" }}>
                <Form onSubmit={msg !== "OTP verified!" ? handleSubmit(handleForgotPwd) : handleSubmit(handleChgPwd)}>
                    <div className="d-flex justify-content-center align-items-center">

                        <Card style={{ background: colors.tertiaryColor, minHeight: "68vh", width: "50vw", borderRadius: "6vh" }}
                            className="d-flex justify-content-center mt-4 mb-4">

                            {!loading ? (
                                <CardBody className="p-4">
                                    <div className="mb-5">
                                        <h1 className="text-center" style={{ color: "white" }}>Forgot Password</h1>
                                    </div>

                                    <Label tag="h5" style={{ color: "white" }}>Email:</Label>
                                    <input className="form-control" style={{ width: "45%" }} placeholder="eg@email.com" disabled={msg === "OTP verified!"}
                                        {...register('Email')} />
                                    <div style={{ minHeight: "2rem", color: colors.secondaryColor, fontSize: "0.9rem" }}>
                                        <u>{errors.Email?.message}</u>
                                    </div>

                                    {
                                        msg === "OTP verified!" && (
                                            <>
                                                <Label tag="h5" style={{ color: "white" }}>New Password:</Label>
                                                <PasswordInput register={register} name={"newPassword"} />
                                                <div style={{ minHeight: "2rem", color: colors.secondaryColor, fontSize: "0.9rem" }}>
                                                    <u>{errors.newPassword?.message}</u>
                                                </div>

                                                <Label tag="h5" style={{ color: "white" }}>Confirm New Password:</Label>
                                                <PasswordInput register={register} name={"confpwd"} />
                                                <div style={{ minHeight: "2rem", color: colors.secondaryColor, fontSize: "0.9rem" }}>
                                                    <u>{errors.confpwd?.message}</u>
                                                </div>
                                            </>)
                                    }

                                    <div className="d-flex flex-column gap-4">
                                        <Link className="form-group" to="/">Login</Link>
                                    </div>

                                    <div className="d-flex align-items-end justify-content-end mt-5">
                                        <Button className="primaryButton" type="submit" style={{ width: "15vw" }}>{msg !== "OTP verified!" ? "Forgot Password" : "Change Password"}</Button>
                                    </div>

                                </CardBody>
                            ) : (
                                <CenteredSpinner />
                            )
                            }

                        </Card>
                    </div>
                </Form>

                {/* OTP Modal */}
                <OtpModal
                    isOpen={modalOpen}
                    toggle={handleModalToggle}
                    Email={watch("Email")}
                />

        </div >
    )
}