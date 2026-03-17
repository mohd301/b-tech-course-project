import { Button, Container, Form, Label, Card, CardBody } from "reactstrap"
import { Link } from "react-router-dom"
import { ChgPwdThunk } from "../slices/SliceAuth"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useForm } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify"

import { useTheme } from "../compsMisc/ThemeContext"
import { determineRoute } from "../functions/determineRoute"
import { getUserType } from "../functions/getUserType"

import SchemaChgPwd from "../validations/SchemaChgPwd"
import PasswordInput from "../compsMisc/PasswordInput"
import CenteredSpinner from "../compsMisc/CenteredSpinner"

export default function ChangePwd() {
    const { theme } = useTheme();

    const msg = useSelector((state) => state.auth.msg)
    const loading = useSelector((state) => state.auth.loading)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(SchemaChgPwd)
    })

    const handleChgPwd = async (data) => {
        try {
            const res = await dispatch(ChgPwdThunk(data)).unwrap()
            const serverMsg = res.serverMsg
            if (serverMsg === "Password changed successfully!") {
                toast.success(serverMsg)
                const route = determineRoute(getUserType())
                navigate(route, { replace: true });
            } else {
                toast.error(serverMsg)
            }
        } catch (err) {
            console.log(err)
        }
    }
    return (
        <div style={{ background: theme.primaryBackground, minHeight: "80vh" }}>
            <Form onSubmit={handleSubmit(handleChgPwd)}>
                <div className="d-flex justify-content-center align-items-center">

                    <Card style={{ background: theme.tertiaryColor, minHeight: "68vh", width: "50vw", borderRadius: "6vh" }}
                        className="d-flex justify-content-center mt-4 mb-4 logRegCard">

                        {!loading ? (
                            <CardBody className="p-4">
                                <div className="mb-5">
                                    <h1 className="text-center" style={{ color: theme.textColorAlt }}>Change Password</h1>
                                </div>

                                <Label tag="h5" style={{ color: theme.textColorAlt }}>Old Password:</Label>
                                <PasswordInput register={register} name={"oldPassword"} />
                                <div style={{ minHeight: "2rem", color: theme.secondaryColor, fontSize: "0.85rem" }}>
                                    <u>{errors.oldPassword?.message}</u>
                                </div>

                                <Label tag="h5" style={{ color: theme.textColorAlt }}>New Password:</Label>
                                <PasswordInput register={register} name={"newPassword"} />
                                <div style={{ minHeight: "2rem", color: theme.secondaryColor, fontSize: "0.85rem" }}>
                                    <u>{errors.newPassword?.message}</u>
                                </div>

                                <Label tag="h5" style={{ color: theme.textColorAlt }}>Confirm New Password:</Label>
                                <PasswordInput register={register} name={"confpwd"} />
                                <div style={{ minHeight: "2rem", color: theme.secondaryColor, fontSize: "0.85rem" }}>
                                    <u>{errors.confpwd?.message}</u>
                                </div>

                                <div className="d-flex flex-column" style={{ width: "50%" }}>
                                    <Link style={{ color: theme.textColorAlt }} className="form-group" to="/home">Home</Link>
                                </div>

                                <div className="d-flex align-items-end justify-content-end mt-5">
                                    <Button className="primaryButton" type="submit" style={{ width: "15vw" }}>Change Password</Button>
                                </div>

                            </CardBody>
                        ) : (
                            <CenteredSpinner color={theme.primaryColor} />
                        )
                        }

                    </Card>

                </div>

            </Form>
        </div>
    )
}