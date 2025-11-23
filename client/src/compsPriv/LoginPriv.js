import { Container, Form, FormGroup, Label, Row, Col, Card, CardTitle, CardBody, CardFooter, Input, Button, Spinner } from "reactstrap"
import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { useState, useEffect } from "react"
import { adminLoginThunk } from "../slices/SliceAdmin.js"
import { useNavigate } from "react-router-dom"
import { colors } from "../styles/colors.js"

export default function LoginPriv() {

    const [loginId, setLoginId] = useState("")
    const [loginPwd, setLoginPwd] = useState("")

    const msg = useSelector((state) => state.admin.msg)
    const loading = useSelector((state) => state.admin.loading)
    const adminLoginDispatch = useDispatch()
    const navigate = useNavigate()
    const type = useSelector((state)=>state.admin.type)

    useEffect(() => {
        if (msg === "Welcome" && type=="Admin") {
            navigate("/adminPage");
        }
        else if(msg === "Welcome" && type=="Admin"){
            navigate("/Regulator")
        }
    }, [msg, navigate]);

    const handleAdminLogin = (e) => {
        try {
            e.preventDefault()
            const loginData = {
                Email: loginId,
                Password: loginPwd
            }
            adminLoginDispatch(adminLoginThunk(loginData))
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <div style={{ background: colors.primaryBackground, height: "80vh" }}>
            <Container fluid>
                <Form >
                    <div className="d-flex justify-content-center align-items-center">

                        <Card style={{ background: colors.secondaryBackground, height: "68vh", width: "50vw", borderRadius: "6vh" }}
                            className="mt-4 p-3 ">

                            <CardTitle className="text-center" tag='h1' style={{ color: "white" }}>Admin Login</CardTitle>
                            {!loading ? (
                                <>
                                    <CardBody>

                                        <FormGroup>
                                            <Label style={{ color: "white" }}>Admin User Name</Label>
                                            <Input style={{ background: colors.primaryBackground, color: "white", width: "60%" }} name="UserName" placeholder="email@email.com"
                                                value={loginId} onChange={(e) => setLoginId(e.target.value)} />
                                        </FormGroup>


                                        <FormGroup>
                                            <Label style={{ color: "white" }}>Password</Label>
                                            <Input name="pass" style={{ background: colors.primaryBackground, color: "white", width: "60%" }} placeholder="*******" type="password"
                                                value={loginPwd} onChange={(e) => setLoginPwd(e.target.value)} />
                                        </FormGroup>

                                        {
                                            msg ? <div style={{ color: "red" }}>{msg}</div> : null
                                        }

                                    </CardBody>
                                    <CardFooter className="text-center">
                                        <Row>
                                            <Col>
                                                <Button onClick={handleAdminLogin} type="button">Login</Button>
                                            </Col>
                                            <Col>
                                                <Link to="/">User Login</Link>
                                            </Col>
                                        </Row>
                                    </CardFooter>
                                </>
                            ) : (
                                <Container fluid className="d-flex justify-content-center align-items-center">
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