import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { verifyOtpThunk } from "../../slices/SliceUser";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Badge } from "../ui/badge"
import { Alert, AlertDescription } from "../ui/alert"
import { Skeleton } from "../ui/skeleton"

export default function OtpModal({ isOpen, toggle, Email }) {
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

    const handleResend = () => {
        setTimeLeft(300);
        setExpired(false);
        // Resend OTP logic would go here
    }

    return (
        <Dialog open={isOpen} onOpenChange={toggle}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Enter OTP</DialogTitle>
                    <DialogDescription>
                        An OTP was sent to your email, please enter it here:
                    </DialogDescription>
                </DialogHeader>

                {!loading ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="otp">OTP Code</Label>
                            <Input
                                id="otp"
                                type="text"
                                placeholder="Enter OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                disabled={expired}
                            />
                        </div>

                        {/* Timer */}
                        <div className="flex items-center gap-2">
                            <span>Time left:</span>
                            <Badge variant={timeLeft < 60 ? "destructive" : "default"}>
                                {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
                            </Badge>
                        </div>

                        {expired && (
                            <Alert variant="destructive">
                                <AlertDescription>
                                    OTP Expired! Please close and try again.
                                </AlertDescription>
                            </Alert>
                        )}

                        {msg === "Invalid OTP" && (
                            <Alert variant="destructive">
                                <AlertDescription>{msg}</AlertDescription>
                            </Alert>
                        )}

                        <DialogFooter className="flex justify-between">
                            <Button variant="outline" onClick={toggle} disabled={loading}>
                                Cancel
                            </Button>
                            {!expired && (
                                <Button variant="ghost" onClick={handleResend} disabled={loading || timeLeft > 270}>
                                    {timeLeft > 270 ? `Resend available in ${Math.floor((timeLeft - 270))}s` : "Resend OTP"}
                                </Button>
                            )}
                            <Button onClick={handleOtp} disabled={expired || loading}>
                                {loading ? <Skeleton className="h-5 w-20" /> : "Confirm OTP"}
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <div className="py-8">
                        <Skeleton className="h-24 w-full" />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
