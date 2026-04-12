import { useState, useEffect } from "react"
import { Button, Input, Card, Form, Label, CardBody, CardImg, CardHeader, CardFooter } from "reactstrap"
import { useSelector, useDispatch } from "react-redux"
import { FiXCircle } from "react-icons/fi";
import { FiCheckCircle } from "react-icons/fi";
import { MdRateReview } from "react-icons/md";
import { toast } from "react-toastify";

import { useForm } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup";
import SchemaID from "../validations/SchemaID"

import { useTheme } from "../compsMisc/ThemeContext"
import { decryptToken } from "../functions/decryptToken"
import { userApplyThunk } from "../slices/SliceUser"

import CenteredSpinner from "../compsMisc/CenteredSpinner"

export default function Apply() {
    const { theme } = useTheme()
    const [Data, Setdata] = useState()
    const [res, Setres] = useState("")
    const dispatch = useDispatch()
    const loading = useSelector((state) => state.user.loading)

    const { register, handleSubmit, getValues, watch, formState: { errors } } = useForm({
        resolver: yupResolver(SchemaID)
    })

    async function getdata(data) {
       
     try {
            const user = decryptToken() // Function will automatically get token from local storage
            
            data._id = user.id
            
            const res = await dispatch(userApplyThunk(data)).unwrap()
            Setdata(res.Data)
            Setres("!")
            if (res.serverMsg !== "Success!") {
                toast.error(res.serverMsg)
            }
        } catch (e) {
            console.log(e)
        }
    }

    return (
        <>
            <div style={{ background: theme.primaryBackground, minHeight: "82.1vh" }}>
                <Form onSubmit={handleSubmit(getdata)}>
                    <div className="d-flex justify-content-center align-items-center">
                        <Card style={{ background: theme.tertiaryColor, minHeight: "68vh", width: "50vw", borderRadius: "6vh" }}
                            className="d-flex justify-content-center mt-4 mb-4 logRegCard">
                            {!loading ? (
                                <CardBody className="p-4">
                                    <div className="mb-5">
                                        <h1 className="text-center" style={{ color: theme.textColorAlt }}>Apply for Eligibity</h1>
                                    </div>
                                    <Label style={{ color: theme.textColorAlt }}>Enter your ID</Label>
                                    <input className="form-control" type="text" name="ID" style={{ width: "45%" }} placeholder="ID" {...register('ID')}></input>
                                    <div style={{ minHeight: "2rem", color: theme.textError, fontSize: "0.95rem" }}>
                                        <u>{errors.ID?.message}</u>
                                    </div>

                                    {Data && res === "!" ? (
                                        Data?.Fraud === 1 ? (<Card style={{ background: theme.tertiaryColor, minHeight: "20vh", width: "15vw", borderRadius: "6vh" }}
                                            className="d-flex justify-content-center mt-4 mb-4 logRegCard">
                                            <CardHeader className="d-flex justify-content-center">
                                                <MdRateReview style={{ color: theme.sus }} className="justify-content-center"
                                                    size={"3em"} />
                                            </CardHeader>
                                            <CardFooter>
                                                <p style={{ color: theme.textColorAlt }} className="text-center">Under Review</p>
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

                                        <Button style={{ background: theme.primaryColor }} type="submit">Submit</Button>
                                    </div>


                                </CardBody>
                            ) : (
                                <CenteredSpinner color={theme.primaryColor} />
                            )}
                        </Card>
                    </div>
                </Form>
            </div>
        </>
    )
}