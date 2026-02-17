import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Modal, ModalHeader, ModalBody, ModalFooter, Label, FormGroup, Button, Container } from "reactstrap";

import { verifyOtpThunk } from "../slices/SliceUser";
import { useTheme } from "../compsMisc/ThemeContext";

import CenteredSpinner from "../compsMisc/CentredSpinner";

export default function OtpModal({ isOpen, toggle, Email }) {
    const { theme } = useTheme();

    const [otp, setOtp] = useState("")
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    const [expired, setExpired] = useState(false);

    const otpDispatch = useDispatch()
    const loading = useSelector((state) => state.user.loading)
    const msg = useSelector((state) => state.user.msg)

    // Countdown timer
    useEffect(() => {
        if (!isOpen) return; // Reset timer only when modal is opened
        setTimeLeft(300);
        setExpired(false);

        const interval = setInterval(() => {
            setTimeLeft(prev => {
                // if there's no time left expires
                if (prev <= 1) {
                    clearInterval(interval);
                    setExpired(true);
                    return 0;
                }
                // otherwise subtract 1
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isOpen]);

    // Format minutes and seconds
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const handleOtp = () => {
        const otpData = {
            Email,
            OTP: otp
        }
        otpDispatch(verifyOtpThunk(otpData))
    }

    return (
        <Modal isOpen={isOpen} toggle={toggle} >
            <ModalHeader>Enter OTP</ModalHeader>
            {!loading ? (
                <ModalBody>
                    <FormGroup>
                        <Label>An OTP was sent to your email, please enter it here:</Label>
                    </FormGroup>

                    <FormGroup>
                        <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} disabled={expired}></input>
                    </FormGroup>

                    {/* Timer */}
                    <div style={{ marginTop: "1rem" }}>
                        Time left: <span style={{ color: timeLeft < 60 ? theme.secondaryColor : theme.textColorAlt}}> {/* Turns red when less than 1 minute remaining */}
                            {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")} {/* padStart ensures string is 2 chars long. pads with 0s otherwise */}
                        </span>
                    </div>
                    {expired && <span style={{ color: theme.secondaryColor }}>OTP Expired! close this and try again</span>}
                    <ModalFooter>
                        <Button className="secondaryButton" onClick={toggle}>Cancel</Button>
                        <Button className="mainButton" onClick={handleOtp} disabled={expired}>Confirm OTP</Button>
                    </ModalFooter>
                    {msg === "Invalid OTP" && <div className="text-center" style={{ color: theme.secondaryColor }}>{msg}</div>}
                </ModalBody>
            ) : (
                <CenteredSpinner height="10vh" color="primary" />
            )}
        </Modal>
    )
}