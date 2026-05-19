
import { useState, useEffect, useRef, useCallback } from "react"
import { Button, Input, Card, Form, Label, CardBody, CardImg, CardHeader, CardFooter } from "reactstrap"
import { useSelector, useDispatch } from "react-redux"
import { FiXCircle } from "react-icons/fi";
import { FaCamera } from "react-icons/fa";
import { FiCheckCircle } from "react-icons/fi";
import { MdRateReview } from "react-icons/md";
import { toast } from "react-toastify";
import Tesseract from 'tesseract.js';
import { useForm } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup";
import SchemaID from "../validations/SchemaID"

import { useTheme } from "../compsMisc/ThemeContext"
import { decryptToken } from "../functions/decryptToken"
import { userApplyThunk } from "../slices/SliceUser"

import CenteredSpinner from "../compsMisc/CenteredSpinner"
import { date } from "yup";

export default function Apply() {
    const { theme } = useTheme()
    const [Data, Setdata] = useState()
    const [res, Setres] = useState("")
    const rejectionReason = Data?.Reason || Data?.reson
    const dispatch = useDispatch()
    const loading = useSelector((state) => state.user.loading)
    const { register, handleSubmit, getValues, watch, setValue, formState: { errors } } = useForm({
        resolver: yupResolver(SchemaID)
    })

    // ── Camera state ──────────────────────────────────────────────
    const [cameraOpen, setCameraOpen] = useState(false)
    const [ocrLoading, setOcrLoading] = useState(false)
    const [ocrProgress, setOcrProgress] = useState(0)
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const streamRef = useRef(null)

    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } }
            })
            streamRef.current = stream
            setCameraOpen(true) // trigger render first, then attach in useEffect
        } catch (e) {
            toast.error("Camera access denied. Please enter the ID manually.")
        }
    }, [])

    // Attach stream to video element AFTER it renders
    useEffect(() => {
        if (cameraOpen && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current
            videoRef.current.play().catch(() => { })
        }
    }, [cameraOpen])

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop())
            streamRef.current = null
        }
        setCameraOpen(false)
    }, [])

    const captureAndScan = useCallback(async () => {
        const video = videoRef.current
        const canvas = canvasRef.current
        if (!video || !canvas) return

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext("2d")
        ctx.filter = "grayscale(1) contrast(1.4)"
        ctx.drawImage(video, 0, 0)

        stopCamera()
        setOcrLoading(true)
        setOcrProgress(0)

        try {
            // Convert canvas to Blob before passing to Tesseract
            const blob = await new Promise((resolve, reject) => {
                canvas.toBlob((b) => {
                    if (b) resolve(b)
                    else reject(new Error("Canvas toBlob failed"))
                }, "image/png")
            })

            const { data } = await Tesseract.recognize(blob, "eng", {
                logger: (m) => {
                    if (m.status === "recognizing text") {
                        setOcrProgress(Math.round(m.progress * 100))
                    }
                }
            })
            console.log(data.text)
            const idMatch = data.text.match(/\b[0-9]{8}\b/)

            // find all dates
            const dateMatches = [...data.text.matchAll(
                /\b(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[0-2])\/(19|20)\d{2}\b/g
            )];

            const parsedDates = dateMatches.map(d => {
                const [day, month, year] = d[0].split("/").map(Number);
                return {
                    raw: d[0],
                    date: new Date(year, month - 1, day)
                };
            });

            parsedDates.sort((a, b) => a.date - b.date);

            if (idMatch && parsedDates) {
                const dob = parsedDates[0];                         // oldest
                const expiry = parsedDates[parsedDates.length - 1]; // newest

                const today = new Date()

                if (expiry.date > today) {
                    setValue("ID", idMatch[0])
                    setValue("ExpiryDate", expiry.raw);
                    toast.success("ID extracted successfully!")
                } else {
                    toast.warning("Your ID has expired. Please renew your ID before applying.")
                }
            } else if (idMatch && !parsedDates) {
                setValue("ID", idMatch[0])
                toast.warning("ID extracted but expiry date not detected. Please verify manually.")
            }
            else {
                toast.warning("Could not detect an ID number. Please enter manually.")
            }
        } catch (e) {
            toast.error("OCR failed. Please enter the ID manually.")
        } finally {
            setOcrLoading(false)
        }
    }, [stopCamera, setValue])

    // Stop camera if component unmounts
    useEffect(() => () => stopCamera(), [stopCamera])

    async function getdata(data) {
        try {
            const user = decryptToken()
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
        <div style={{ background: theme.primaryBackground, minHeight: "82.1vh" }}>
            <Form onSubmit={handleSubmit(getdata)}>
                <div className="d-flex justify-content-center align-items-center">
                    <Card style={{ background: theme.tertiaryColor, minHeight: "68vh", width: "50vw", borderRadius: "6vh" }}
                        className="d-flex justify-content-center mt-4 mb-4 logRegCard">
                        {!loading ? (
                            <CardBody className="p-4">
                                <div className="mb-5">
                                    <h1 className="text-center" style={{ color: theme.textColorAlt }}>Apply for Eligibility</h1>
                                </div>
                                <Label style={{ color: theme.textColorAlt }}>Enter your ID</Label>

                                {/* ── ID input + camera button  ── */}
                                <div className="d-flex align-items-center gap-2" style={{ width: "45%" }}>
                                    <input
                                        className="form-control"
                                        type="text"
                                        name="ID"
                                        placeholder="ID"
                                        {...register('ID')}
                                    />
                                    <Button
                                        type="button"
                                        title="Scan ID with camera"
                                        onClick={cameraOpen ? stopCamera : startCamera}
                                        style={{
                                            background: cameraOpen ? theme.secondaryColor : theme.primaryColor,
                                            border: "none",
                                            borderRadius: "0.5rem",
                                            padding: "0.375rem 0.65rem",
                                            flexShrink: 0,
                                            fontSize: "1.2rem",
                                            lineHeight: 1
                                        }}
                                    >
                                        {cameraOpen ? "✕" : <FaCamera />}
                                    </Button>
                                </div>

                                {/* ── Camera preview ── */}
                                {cameraOpen && (
                                    <div className="mt-3" style={{ width: "45%", position: "relative" }}>
                                        <div style={{ position: "relative", borderRadius: "0.5rem", overflow: "hidden", background: "#000" }}>
                                            <video
                                                ref={videoRef}
                                                playsInline
                                                muted
                                                style={{ width: "100%", display: "block" }}
                                            />
                                            {/* ID guide overlay */}
                                            <div style={{
                                                position: "absolute", inset: 0,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                pointerEvents: "none"
                                            }}>
                                                <div style={{
                                                    width: "80%", height: "61%",
                                                    border: "2px solid rgba(255,255,255,0.75)",
                                                    borderRadius: "0.4rem"
                                                }} />
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            className="w-100 mt-2"
                                            style={{ background: theme.primaryColor, border: "none" }}
                                            onClick={captureAndScan}
                                        >
                                            📸 Capture &amp; Scan
                                        </Button>
                                    </div>
                                )}

                                {/* ── OCR progress bar ── */}
                                {ocrLoading && (
                                    <div className="mt-2" style={{ width: "45%" }}>
                                        <small style={{ color: theme.textColorAlt }}>Scanning… {ocrProgress}%</small>
                                        <div style={{ height: 4, borderRadius: 99, background: "rgba(0,0,0,0.1)", marginTop: 4 }}>
                                            <div style={{
                                                height: "100%", borderRadius: 99,
                                                background: theme.primaryColor,
                                                width: `${ocrProgress}%`,
                                                transition: "width 0.2s ease"
                                            }} />
                                        </div>
                                    </div>
                                )}

                                {/* Hidden canvas for frame capture */}
                                <canvas ref={canvasRef} style={{ display: "none" }} />
                                {/* ── End camera additions ── */}

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

                                                    {rejectionReason ? (
                                                        <p style={{ color: theme.textColorAlt }} className="text-center">{rejectionReason} is too high</p>
                                                    ) : null}
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
    )
}
