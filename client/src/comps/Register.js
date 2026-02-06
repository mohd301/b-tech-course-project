import { Button, Container, Form, Label, Card, CardBody, Spinner } from "reactstrap"
import { colors } from "../styles/colors"
import { Link } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"

import { addUserThunk } from "../slices/SliceUser"
import { sendOtpThunk } from "../slices/SliceUser"
import { resetFlag } from "../slices/SliceUser"

import { useForm } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup";
import SchemaReg from "../validations/SchemaReg"

import OtpModal from "./OtpModal"

import { alertAuth } from "../functions/alertAuth"

import PasswordInput from "../compsMisc/PasswordInput"

export default function Register() {
    const [modalOpen, setModalOpen] = useState(false);

    const msg = useSelector((state) => state.user.msg)
    const flag = useSelector((state) => state.user.flag)
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

        if (msg === "Registration Success!" && flag) {
            regUserDispatch(resetFlag());
            toast.success(msg)
            navigate("/");
        }
    }, [msg, regUserDispatch, navigate]);

    useEffect(() => {
        const localToken = localStorage.getItem("authToken");
        if (localToken && !alertedRef.current) {
            alertedRef.current = true;
            alertAuth(navigate);
        }
    }, [navigate]);

    const handleModalToggle = () => { setModalOpen(!modalOpen) };

    const handleRegister = async (data) => {
        try {
            const res = await regUserDispatch(sendOtpThunk({ Email: data.Email })).unwrap()
            let serverMsg = res.serverMsg
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
        <div style={{ background: colors.primaryBackground, minHeight: "80vh" }}>
            <Container fluid>
                <Form onSubmit={handleSubmit(handleRegister)}>
                    <div className="d-flex justify-content-center align-items-center">

                        <Card style={{ background: colors.tertiaryColor, minHeight: "68vh", width: "50vw", borderRadius: "6vh" }} className="mt-4 p-3">
                            {!loading ? (
                                <CardBody>
                                    <div className="mb-2">
                                        <h1 className="text-center" style={{ color: "white" }}>Register</h1>
                                    </div>

                                    <Label tag="h5" style={{ color: "white" }}>Email</Label>
                                    <input className="form-control" style={{ width: "45%" }} placeholder="eg@email.com" {...register('Email')} />
                                    <div style={{ minHeight: "2rem", color: colors.secondaryColor, fontSize: "0.85rem" }}>
                                        <u>{errors.Email?.message}</u>
                                    </div>

                                    <Label tag="h5" style={{ color: "white" }}>Phone Number</Label>
                                    <input className="form-control" style={{ width: "45%" }} placeholder="9xxx-xxxx" {...register('Phone')} />
                                    <div style={{ minHeight: "2rem", color: colors.secondaryColor, fontSize: "0.85rem" }}>
                                        <u>{errors.Phone?.message}</u>
                                    </div>

                                    <Label tag="h5" style={{ color: "white" }}>Password</Label>
                                    <PasswordInput register={register} name={'Password'} />
                                    <div style={{ minHeight: "2rem", color: colors.secondaryColor, fontSize: "0.85rem" }}>
                                        <u>{errors.Password?.message}</u>
                                    </div>

                                    <Label tag="h5" style={{ color: "white" }}>Confirm Password</Label>
                                    <PasswordInput register={register} name={'confpwd'} />
                                    <div style={{ minHeight: "2rem", color: colors.secondaryColor, fontSize: "0.85rem" }}>
                                        <u>{errors.confpwd?.message}</u>
                                    </div>

                                    <div className="d-flex flex-column">
                                        <Link className="form-group" to="/">Back to Login</Link>
                                    </div>

                                    <div className="d-flex align-items-end justify-content-end mt-5">
                                        <Button className="primaryButton" type="submit">Register</Button>
                                    </div>

                                </CardBody>
                            ) : (
                                <Container fluid className="d-flex justify-content-center align-items-center" style={{ height: "68vh" }}>
                                    <Spinner color="light" />
                                </Container>
                            )}
                        </Card>

                    </div>

                </Form>
            </Container>
            {/* OTP Modal */}
            <OtpModal
                isOpen={modalOpen}
                toggle={handleModalToggle}
                Email={watch("Email")}
            />
        </div>
    )
}