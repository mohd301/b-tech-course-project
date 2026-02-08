import { Container, Form, FormGroup, Label, Row, Col, Card, CardTitle, CardBody, CardFooter, Input, Button } from "reactstrap"
import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { useState, useEffect, useRef } from "react"
import { privLoginThunk } from "../slices/SlicePriv.js"
import { useNavigate } from "react-router-dom"
import { colors } from "../styles/colors.js"
import { toast } from "react-toastify"

import { checkAuth } from "../functions/checkAuth.js"
import { getUserType } from "../functions/getUserType.js"

import PasswordInput from "../compsMisc/PasswordInput.js"
import CenteredSpinner from "../compsMisc/CentredSpinner.js"

export default function LoginPriv() {

    const [loginId, setLoginId] = useState("")
    const [loginPwd, setLoginPwd] = useState("")

    const msg = useSelector((state) => state.priv.msg)
    const loading = useSelector((state) => state.priv.loading)
    const privLoginDispatch = useDispatch()
    const navigate = useNavigate()
    const alertedRef = useRef(false);

    useEffect(() => {
        checkAuth(alertedRef, navigate)
    }, [navigate]);

    const handlePrivLogin = async (e) => {
        try {
            e.preventDefault()
            const loginData = {
                Email: loginId,
                Password: loginPwd
            }
            const res = await privLoginDispatch(privLoginThunk(loginData)).unwrap()
            const { serverMsg, token } = res
            if (serverMsg === "Welcome" && token) {
                toast.success(serverMsg)
                localStorage.setItem("authToken", token);

                const type = getUserType()
                if (type === "Admin") {
                    navigate("/homeAdmin", { replace: true });
                } else if (type === "Regulator") {
                    navigate("/homeReg", { replace: true })
                }
                return;
            } else {
                toast.error(serverMsg);
                return;
            }
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <div style={{ background: colors.primaryBackground, minHeight: "80vh" }}>
            <Form >
                <div className="d-flex justify-content-center align-items-center">

                    <Card style={{ background: colors.tertiaryColor, height: "68vh", width: "50vw", borderRadius: "6vh" }}
                        className="d-flex justify-content-center mt-4 mb-4">

                        {!loading ? (
                            <CardBody className="p-4">
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
                                    <PasswordInput value={loginPwd} onChange={(e) => setLoginPwd(e.target.value)} />
                                </FormGroup>

                                <div className="d-flex flex-column gap-4">
                                    <Link className="form-group" to="/">User Login</Link>
                                </div>

                                <div className="d-flex align-items-end justify-content-end mt-5">
                                    <Button className="primaryButton" onClick={handlePrivLogin}>Login</Button>
                                </div>

                            </CardBody>
                        ) : (
                            <CenteredSpinner />
                        )
                        }
                    </Card>
                </div>
            </Form>
        </div>
    )
}