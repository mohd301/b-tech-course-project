import { Button, Container, Form, Input, Label, Card, CardBody, Spinner } from "reactstrap"
import { Link } from "react-router-dom"
import { colors } from "../styles/colors"
import { useEffect, useState, useRef } from "react"
import { userLoginThunk } from "../slices/SliceUser"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { alertAuth } from "../functions/alertAuth"

import PasswordInput from "../compsMisc/PasswordInput"

export default function Login() {
    const [loginId, setLoginId] = useState("")
    const [loginPwd, setLoginPwd] = useState("")

    const msg = useSelector((state) => state.user.msg)
    const token = useSelector((state) => state.user.token)
    const loading = useSelector((state) => state.user.loading)
    const userlogindispatch = useDispatch()
    const navigate = useNavigate()
    const alertedRef = useRef(false);

    useEffect(() => {
        if (msg === "Welcome" && token) {
            localStorage.setItem("authToken", token);
            navigate("/home", { replace: true });
            return;
        }
        const localToken = localStorage.getItem("authToken")
        // Prevent authenticated user from logging in again
        if (localToken && !alertedRef.current) {
            // Prevent multiple alerts
            alertedRef.current = true;
            alertAuth(navigate);
        }
    }, [msg, token, navigate]);

    const handleLogin = (e) => {
        try {
            e.preventDefault()
            const loginData = {
                Email: loginId,
                Password: loginPwd
            }
            userlogindispatch(userLoginThunk(loginData))
        } catch (err) {
            console.log(err)
        }
    }
    return (
        <div style={{ background: colors.primaryBackground, minHeight: "80vh" }}>
            <Container fluid>
                <Form >
                    <div className="d-flex justify-content-center align-items-center">

                        <Card style={{ background: colors.tertiaryColor, minHeight: "68vh", width: "50vw", borderRadius: "6vh" }}
                            className="mt-4 p-3 ">

                            {!loading ? (
                                <CardBody>
                                    <div className="mb-5">
                                        <h1 className="text-center" style={{ color: "white" }}>Login</h1>
                                    </div>

                                    <Label tag="h5" style={{ color: "white" }}>Email:</Label>
                                    <Input style={{ width: "45%" }} name="UserName" placeholder="eg@email.com"
                                        value={loginId} onChange={(e) => setLoginId(e.target.value)} />
                                    <br />

                                    <Label tag="h5" style={{ color: "white" }}>Password:</Label>
                                    <PasswordInput value={loginPwd} onChange={(e) => setLoginPwd(e.target.value)} />
                                    <br />

                                    <div className="d-flex flex-column gap-4">
                                        <Link className="form-group" to="changePwd">Change Password</Link>
                                        <Link className="form-group" to="regUser">Register</Link>
                                        <Link className="form-group" to="logPriv">Admin / Regulator</Link>
                                    </div>

                                    <div className="d-flex align-items-end justify-content-end mt-5">
                                        <Button className="primaryButton" onClick={handleLogin}>Login</Button>
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