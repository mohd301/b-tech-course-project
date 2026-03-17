import axios from "axios"
import { useState, useEffect } from "react"
import { Button, Input, Card, Form, Label, CardBody, CardImg, CardHeader, CardFooter } from "reactstrap"
import { useSelector, useDispatch } from "react-redux"
import { FiXCircle } from "react-icons/fi";
import { FiCheckCircle } from "react-icons/fi";
import { MdRateReview } from "react-icons/md";
import { useTheme } from "../compsMisc/ThemeContext"
import { decryptToken } from "../functions/decryptToken"
import { userApplyThunk } from "../slices/SliceUser"
export default function Apply() {
    const token = localStorage.getItem("authToken")
    const user = decryptToken(token)
    console.log(user)
    const { theme } = useTheme()
    const [Data, Setdata] = useState()
    const [res, Setres] = useState("")
    const dispatch = useDispatch()
    const data = useSelector((state) => state.user.data)
    async function getdata(data) {
        // try {
        //     console.log(ID)
        //     const res = await axios.get("http://127.0.0.1:5000/EEml/" + ID + "/" + user.id)

        //     console.log(res.data)
        //     Setdata(res.data)
        //     Setres("!")

        // } catch (e) {
        //     console.log(e)
        // }
        try {
            const res = await dispatch(userApplyThunk(data)).unwrap()
            Setdata(res.Data)
            console.log(res)
            Setres("!")

        } catch (e) {
            console.log(e)
        }
    }
    const handleid = (e) => {
        SetId(e.target.value)
    }
    console.log(Data)
    console.log(Data?.reson)
    const [ID, SetId] = useState("")
    const userdata = {
        ID,
        _id: user.id,
        Email: user.Email,
    }

    const onsubmit = () => {
        getdata(userdata)
    }
    return (
        <>
            <div style={{ background: theme.primaryBackground, minHeight: "82.1vh" }}>
                <Form>
                    <div className="d-flex justify-content-center align-items-center">
                        <Card style={{ background: theme.tertiaryColor, minHeight: "68vh", width: "50vw", borderRadius: "6vh" }}
                            className="d-flex justify-content-center mt-4 mb-4 logRegCard">
                            <CardBody className="p-4">
                                <div className="mb-5">
                                    <h1 className="text-center" style={{ color: theme.textColorAlt }}>Apply for Eligibity</h1>
                                </div>
                                <Label style={{ color: theme.textColorAlt }}>Enter your ID</Label>
                                <Input type="text" name="ID" style={{ width: "45%" }} value={ID} onChange={handleid} placeholder="ID"></Input>
                                {res === "!" ? (
                                    Data?.Fraud === 1 ? (<Card style={{ background: theme.tertiaryColor, minHeight: "20vh", width: "15vw", borderRadius: "6vh" }}
                                        className="d-flex justify-content-center mt-4 mb-4 logRegCard">
                                        <CardHeader className="d-flex justify-content-center">
                                            <MdRateReview style={{ color: theme.sus }} className="justify-content-center"
                                                size={"3em"} />
                                        </CardHeader>
                                        <CardFooter>
                                            <p style={{ color: theme.textColorAlt }} className="text-center">Under Reivew</p>
                                        </CardFooter>
                                    </Card>) :
                                        Data?.Eligibity === 1 ? (

                                            <Card style={{ background: theme.tertiaryColor, minHeight: "20vh", width: "15vw", borderRadius: "6vh" }}
                                                className="d-flex justify-content-center mt-4 mb-4 logRegCard">
                                                <CardHeader className="d-flex justify-content-center">
                                                    <FiCheckCircle style={{ color: theme.primaryColor }} className="justify-content-center"
                                                        size={"3em"} />
                                                </CardHeader>
                                                <CardFooter>
                                                    <p style={{ color: theme.textColorAlt }} className="text-center">Eligible</p>
                                                </CardFooter>
                                            </Card>
                                        ) : (
                                            <Card style={{ background: theme.tertiaryColor, minHeight: "20vh", width: "16vw", borderRadius: "6vh" }}
                                                className="d-flex justify-content-center mt-4 mb-4 logRegCard">
                                                <CardHeader className="d-flex justify-content-center"
                                                ><FiXCircle style={{ color: theme.secondaryColor }} className="justify-content-center"
                                                    size={"3em"} /></CardHeader>
                                                <CardFooter>
                                                    <p style={{ color: theme.textColorAlt }} className="text-center">Not Eligible</p>

                                                    <p style={{ color: theme.textColorAlt }} className="text-center">{Data.reson} is too high</p>
                                                </CardFooter>
                                            </Card>
                                        ))
                                    : (
                                        <></>
                                    )}
                                <div className="d-flex align-items-end justify-content-end mt-5">

                                    <Button style={{ background: theme.primaryColor }} onClick={onsubmit}>Sumbit</Button>
                                </div>


                            </CardBody>
                        </Card>
                    </div>
                </Form>
            </div>
        </>
    )
}