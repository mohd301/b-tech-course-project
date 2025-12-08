import { Container, Form, FormGroup, Label, Row, Col, Card, CardTitle, CardBody, CardFooter, Input, Button, Spinner } from "reactstrap"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { useState, useEffect, useRef } from "react"
import { privLoginThunk } from "../slices/SlicePriv.js"
import { useNavigate } from "react-router-dom"
import { colors } from "../styles/colors.js"

import { alertAuth } from "../functions/alertAuth"
import { getUserType } from "../functions/getUserType.js"

export default function LoginPriv() {

    const [loginId, setLoginId] = useState("")
    const [loginPwd, setLoginPwd] = useState("")
    const [showPassword, setShowPassword] = useState(false)

    const msg = useSelector((state) => state.priv.msg)
    const token = useSelector((state) => state.priv.token)
    const loading = useSelector((state) => state.priv.loading)
    const privLoginDispatch = useDispatch()
    const navigate = useNavigate()
    const alertedRef = useRef(false);

    useEffect(() => {
        if (msg === "Welcome" && token) {
            localStorage.setItem("authToken", token);
            const type = getUserType()
            if (type === "Admin") {
                navigate("/homeAdmin", { replace: true });
            } else if (type === "Regulator") {
                navigate("/homeReg", { replace: true })
            }
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

    const handlePrivLogin = (e) => {
        try {
            e.preventDefault()
            const loginData = {
                Email: loginId,
                Password: loginPwd
            }
            privLoginDispatch(privLoginThunk(loginData))
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <div style={{ background: colors.primaryBackground, minHeight: "80vh" }}>
            <Container fluid>
                <Form >
                    <div className="d-flex justify-content-center align-items-center">

                        <Card style={{ background: colors.tertiaryColor, height: "68vh", width: "50vw", borderRadius: "6vh" }}
                            className="mt-4 p-3 ">

                            {!loading ? (
                                <CardBody>
                                    <div className="mb-5">
                                        <h1 className="text-center" style={{ color: "white" }}>Admin / Regulator Login</h1>
                                    </div>

                                    <FormGroup>
                                        <Label tag="h5" style={{ color: "white" }}>Email:</Label>
                                        <Input style={{ width: "45%" }} name="UserName" placeholder="eg@email.com"
                                            value={loginId} onChange={(e) => setLoginId(e.target.value)} />
                                    </FormGroup>


                                    <FormGroup>
                                        <Label tag="h5" style={{ color: "white" }}>Password:</Label>
                                        <div style={{ position: 'relative', width: '45%' }}>
                                            <Input
                                                name="pass"
                                                style={{ width: "100%" }}
                                                placeholder="*******"
                                                type={showPassword ? "text" : "password"}
                                                value={loginPwd}
                                                onChange={(e) => setLoginPwd(e.target.value)}
                                            />
                                            <span
                                                onClick={() => setShowPassword(!showPassword)}
                                                style={{
                                                    position: 'absolute',
                                                    right: '10px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    cursor: 'pointer',
                                                    color: 'gray'
                                                }}
                                            >
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                            </span>
                                        </div>
                                    </FormGroup>

                                    <div className="d-flex flex-column gap-4">
                                        <Link className="form-group" to="/">User Login</Link>
                                    </div>

                                    <div className="d-flex align-items-end justify-content-end mt-5">
                                        <Button className="primaryButton" onClick={handlePrivLogin}>Login</Button>
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