import { Button, Container, Form, Input, Label, Card, CardBody } from "reactstrap"
import { Link } from "react-router-dom"
import { colors } from "../styles/colors"
import { useEffect, useState, useRef } from "react"
import { userLoginThunk } from "../slices/SliceUser"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"

import { clearMsg } from "../slices/SliceUser"
import { checkAuth } from "../functions/checkAuth"

import CenteredSpinner from "../compsMisc/CentredSpinner"
import PasswordInput from "../compsMisc/PasswordInput"

export default function Login() {
    const [loginId, setLoginId] = useState("")
    const [loginPwd, setLoginPwd] = useState("")

    const msg = useSelector((state) => state.user.msg)
    const loading = useSelector((state) => state.user.loading)
    const userlogindispatch = useDispatch()
    const navigate = useNavigate()
    const alertedRef = useRef(false);

    useEffect(() => {
        userlogindispatch(clearMsg())
        checkAuth(alertedRef,navigate)
    }, [navigate]);

    const handleLogin = async (e) => {
        try {
            e.preventDefault()
            const loginData = {
                Email: loginId,
                Password: loginPwd
            }
            const res = await userlogindispatch(userLoginThunk(loginData)).unwrap()
            const { serverMsg, token } = res
            if (serverMsg === "Welcome" && token) {
                toast.success(serverMsg)
                localStorage.setItem("authToken", token);
                navigate("/home", { replace: true });
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

                    <Card style={{ background: colors.tertiaryColor, minHeight: "68vh", width: "50vw", borderRadius: "6vh" }}
                        className="d-flex justify-content-center mt-4 mb-4">

                        {!loading ? (
                            <CardBody className="p-4">
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
                                    <Link className="form-group" to="forgotPwd">Forgot Password</Link>
                                    <Link className="form-group" to="regUser">Register</Link>
                                    <Link className="form-group" to="logPriv">Admin / Regulator</Link>
                                </div>

                                <div className="d-flex align-items-end justify-content-end mt-5">
                                    <Button className="primaryButton" onClick={handleLogin}>Login</Button>
                                </div>

                            </CardBody>
                        ) : (
                            <CenteredSpinner />
                        )}

                    </Card>
                </div>
            </Form>
        </div>
    )
}