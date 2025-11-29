import { Button, Container, Form, Input, Label, Card, CardBody, Spinner } from "reactstrap"
import { Link } from "react-router-dom"
import { colors } from "../styles/colors"
import { useEffect, useRef } from "react"
import { userChgPwdThunk } from "../slices/SliceUser"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { useForm } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup";
import SchemaChgPwd from "../validations/SchemaChgPwd"

import { alertAuth } from "../functions/alertAuth"

export default function ChangePwd() {
    const msg = useSelector((state) => state.user.msg)
    const token = useSelector((state) => state.user.token)
    const loading = useSelector((state) => state.user.loading)
    const userchgPwdDispatch = useDispatch()
    const navigate = useNavigate()
    const alertedRef = useRef(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(SchemaChgPwd)
    })

    useEffect(() => {
        if (msg === "Password changed successfully!") {
            navigate("/");
        }

        const localToken = localStorage.getItem("authToken")
        // Prevent authenticated user from changing password
        if (localToken && !alertedRef.current) {
            // Prevent multiple alerts
            alertedRef.current = true;
            alertAuth(navigate);
        }
    }, [msg, navigate]);

    const handleChgPwd = (data) => {
        try {
            userchgPwdDispatch(userChgPwdThunk(data))
        } catch (err) {
            console.log(err)
        }
    }
    return (
        <div style={{ background: colors.primaryBackground, minHeight: "80vh" }}>
            <Container fluid>
                <Form onSubmit={handleSubmit(handleChgPwd)}>
                    <div className="d-flex justify-content-center align-items-center">

                        <Card style={{ background: colors.tertiaryColor, minHeight: "68vh", width: "50vw", borderRadius: "6vh" }}
                            className="mt-4 p-3 ">

                            {!loading ? (
                                <CardBody>
                                    <div className="mb-5">
                                        <h1 className="text-center" style={{ color: "white" }}>Change Password</h1>
                                    </div>

                                    <Label tag="h5" style={{ color: "white" }}>Email:</Label>
                                    <input className="form-control" style={{ width: "45%" }} name="UserName" placeholder="eg@email.com"
                                        {...register('Email')} />
                                    <div style={{ minHeight: "2rem", color: colors.secondaryColor, fontSize: "0.85rem" }}>
                                        <u>{errors.Email?.message}</u>
                                    </div>

                                    <Label tag="h5" style={{ color: "white" }}>Old Password:</Label>
                                    <input className="form-control" style={{ width: "45%" }} name="OldPassword" placeholder="*******" type="password"
                                        {...register('oldPassword')} />
                                    <div style={{ minHeight: "2rem", color: colors.secondaryColor, fontSize: "0.85rem" }}>
                                        <u>{errors.oldPassword?.message}</u>
                                    </div>

                                    <Label tag="h5" style={{ color: "white" }}>New Password:</Label>
                                    <input className="form-control" style={{ width: "45%" }} name="NewPassword" placeholder="*******" type="password"
                                        {...register('newPassword')} />
                                    <div style={{ minHeight: "2rem", color: colors.secondaryColor, fontSize: "0.85rem" }}>
                                        <u>{errors.newPassword?.message}</u>
                                    </div>

                                    <Label tag="h5" style={{ color: "white" }}>Confirm New Password:</Label>
                                    <input className="form-control" style={{ width: "45%" }} name="confpwd" placeholder="*******" type="password"
                                        {...register('confpwd')} />
                                    <div style={{ minHeight: "2rem", color: colors.secondaryColor, fontSize: "0.85rem" }}>
                                        <u>{errors.confpwd?.message}</u>
                                    </div>

                                    <div className="d-flex flex-column gap-4">
                                        <Link className="form-group" to="/">Login</Link>
                                    </div>

                                    <div className="d-flex align-items-end justify-content-end mt-5">
                                        <Button className="primaryButton" type="submit" style={{width:"15vw"}}>Change Password</Button>
                                    </div>

                                    {
                                        msg ? <div className="text-center" style={{ color: colors.secondaryColor }}><u>{msg}</u></div> : null
                                    }
                                </CardBody>
                            ) : (
                                <Container fluid className="d-flex justify-content-center align-items-center" style={{ height: "68vh" }}>
                                    <Spinner color="light" />
                                </Container>
                            )
                            }

                        </Card>

                    </div>

                </Form>
            </Container>
        </div>
    )
}