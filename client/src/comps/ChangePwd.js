import { Button, Container, Form, Label, Card, CardBody, Spinner } from "reactstrap"
import { Link } from "react-router-dom"
import { colors } from "../styles/colors"
import { useEffect, useRef } from "react"
import { userChgPwdThunk } from "../slices/SliceUser"
import { resetFlag } from "../slices/SliceUser"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { useForm } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup";
import SchemaChgPwd from "../validations/SchemaChgPwd"

import { alertAuth } from "../functions/alertAuth"
import PasswordInput from "../compsMisc/PasswordInput"

export default function ChangePwd() {
    const msg = useSelector((state) => state.user.msg)
    const flag = useSelector((state) => state.user.flag)
    const loading = useSelector((state) => state.user.loading)
    const userchgPwdDispatch = useDispatch()
    const navigate = useNavigate()
    const alertedRef = useRef(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(SchemaChgPwd)
    })

    useEffect(() => {
        if (msg === "Password changed successfully!" && flag) {
            userchgPwdDispatch(resetFlag())
            navigate("/");
        }
    }, [msg, userchgPwdDispatch, navigate]);

    useEffect(() => {
        const localToken = localStorage.getItem("authToken");
        if (localToken && !alertedRef.current) {
            alertedRef.current = true;
            alertAuth(navigate);
        }
    }, [navigate]);

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

                                    <Label tag="h5" style={{ color: "white" }}>Old Password:</Label>
                                    <PasswordInput register={register} name={"oldPassword"} />
                                    <div style={{ minHeight: "2rem", color: colors.secondaryColor, fontSize: "0.85rem" }}>
                                        <u>{errors.oldPassword?.message}</u>
                                    </div>

                                    <Label tag="h5" style={{ color: "white" }}>New Password:</Label>
                                    <PasswordInput register={register} name={"newPassword"} />
                                    <div style={{ minHeight: "2rem", color: colors.secondaryColor, fontSize: "0.85rem" }}>
                                        <u>{errors.newPassword?.message}</u>
                                    </div>

                                    <Label tag="h5" style={{ color: "white" }}>Confirm New Password:</Label>
                                    <PasswordInput register={register} name={"confpwd"} />
                                    <div style={{ minHeight: "2rem", color: colors.secondaryColor, fontSize: "0.85rem" }}>
                                        <u>{errors.confpwd?.message}</u>
                                    </div>

                                    <div className="d-flex flex-column gap-4">
                                        <Link className="form-group" to="/">Login</Link>
                                    </div>

                                    <div className="d-flex align-items-end justify-content-end mt-5">
                                        <Button className="primaryButton" type="submit" style={{ width: "15vw" }}>Change Password</Button>
                                    </div>

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