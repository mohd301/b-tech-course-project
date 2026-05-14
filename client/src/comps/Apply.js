
import { useState, useEffect, useRef, useCallback } from "react"
import { Button, Input, Card, Form, Label, CardBody, CardImg, CardHeader, CardFooter } from "reactstrap"
import { useSelector, useDispatch } from "react-redux"
import { FiXCircle } from "react-icons/fi";
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
 
export default function Apply() {
    const { theme } = useTheme()
    const [Data, Setdata] = useState()
    const [res, Setres] = useState("")
    const dispatch = useDispatch()
    const loading = useSelector((state) => state.user.loading)
 
    // ── Camera state (added) ──────────────────────────────────────────────
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
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                videoRef.current.play()
            }
            setCameraOpen(true)
        } catch (e) {
            toast.error("Camera access denied. Please enter the ID manually.")
        }
    }, [])
 
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
        // Grayscale + contrast for better OCR accuracy
        ctx.filter = "grayscale(1) contrast(1.4)"
        ctx.drawImage(video, 0, 0)
 
        stopCamera()
        setOcrLoading(true)
        setOcrProgress(0)
 
        try {
            const { data } = await Tesseract.recognize(canvas, "eng", {
                logger: (m) => {
                    if (m.status === "recognizing text") {
                        setOcrProgress(Math.round(m.progress * 100))
                    }
                }
            })
 
            // Extract first sequence that looks like an ID number
            const idMatch = data.text.match(/\b[0-9]{6,12}\b/)
            if (idMatch) {
                setValue("ID", idMatch[0])
                toast.success("ID extracted successfully!")
            } else {
                toast.warning("Could not detect an ID number. Please enter manually.")
            }
        } catch (e) {
            toast.error("OCR failed. Please enter the ID manually.")
        } finally {
            setOcrLoading(false)
        }
    }, [stopCamera])
 
    // Stop camera if component unmounts
    useEffect(() => () => stopCamera(), [stopCamera])
    // ── End camera additions ──────────────────────────────────────────────
 
    const { register, handleSubmit, getValues, watch, setValue, formState: { errors } } = useForm({
        resolver: yupResolver(SchemaID)
    })
 
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
 
                                    {/* ── ID input + camera button (added) ── */}
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
                                            {cameraOpen ? "✕" : "📷"}
                                        </Button>
                                    </div>
 
                                    {/* ── Camera preview (added) ── */}
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
                                                        width: "80%", height: "55%",
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
 
                                    {/* ── OCR progress bar (added) ── */}
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
 
                                    {/* Hidden canvas for frame capture (added) */}
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