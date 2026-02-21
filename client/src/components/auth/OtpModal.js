import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RotateCcw, Clock } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert.js";
import { Skeleton } from "../ui/skeleton";

import { verifyOtpThunk } from "../../slices/SliceUser";
import { sendOtpThunk } from "../../slices/SliceUser";

export default function OtpModal({ isOpen, toggle, Email }) {
  const [otp, setOtp] = useState("");
  const [otpInputs, setOtpInputs] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(300);
  const [expired, setExpired] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const otpDispatch = useDispatch();
  const loading = useSelector((state) => state.user.loading);
  const msg = useSelector((state) => state.user.msg);

  useEffect(() => {
    if (!isOpen) return;
    setTimeLeft(300);
    setExpired(false);

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || expired) {
      setCanResend(true);
      setResendCooldown(0);
      return;
    }

    setCanResend(false);
    setResendCooldown(30);

    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, expired]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleOtpInputChange = (index, value) => {
    if (value.length > 1) {
      value = value.slice(0, 1);
    }

    const newInputs = [...otpInputs];
    newInputs[index] = value;
    setOtpInputs(newInputs);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }

    const combinedOtp = newInputs.join("");
    setOtp(combinedOtp);
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpInputs[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    const newInputs = pastedData.split("").map((char, i) => (i < 6 ? char : ""));

    for (let i = 0; i < 6; i++) {
      if (newInputs[i]) {
        const input = document.getElementById(`otp-input-${i}`);
        if (input) {
          input.value = newInputs[i];
        }
      }
    }

    setOtpInputs(newInputs);
    setOtp(pastedData);
  };

  const handleOtp = () => {
    const otpData = {
      Email,
      OTP: otp
    };
    otpDispatch(verifyOtpThunk(otpData));
  };

  const handleResendOtp = async () => {
    try {
      const res = await otpDispatch(sendOtpThunk({ Email, use: "Reg" })).unwrap();
      const serverMsg = res.serverMsg;
      if (serverMsg === "OTP sent!") {
        setTimeLeft(300);
        setExpired(false);
        setOtpInputs(["", "", "", "", "", ""]);
        setOtp("");
        setCanResend(false);
        setResendCooldown(30);
      } else {
        alert(serverMsg);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const timerVariant = timeLeft < 60 ? "destructive" : "default";

  return (
    <Dialog open={isOpen} onOpenChange={toggle}>
      <DialogContent className="sm:max-w-md">
        {!loading ? (
          <>
            <DialogHeader>
              <DialogTitle>Enter OTP</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                An OTP was sent to your email, please enter it here:
              </p>

              <div
                className="flex gap-2 justify-center"
                onPaste={handleOtpPaste}
              >
                {otpInputs.map((digit, index) => (
                  <Input
                    key={index}
                    id={`otp-input-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    disabled={expired}
                    className="w-12 h-12 text-center text-xl font-bold"
                  />
                ))}
              </div>

              <div className="flex items-center justify-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Badge variant={timerVariant}>
                  {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
                </Badge>
              </div>

              {expired && (
                <Alert variant="destructive">
                  <AlertDescription>
                    OTP Expired! Close this and try again
                  </AlertDescription>
                </Alert>
              )}

              {msg === "Invalid OTP" && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {msg}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResendOtp}
                  disabled={!canResend || expired || loading}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  {canResend ? "Resend OTP" : `Resend (${resendCooldown}s)`}
                </Button>
              </div>
            </div>

            <DialogFooter className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" onClick={toggle}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleOtp}
                disabled={expired || otp.length !== 6}
              >
                Confirm OTP
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="flex items-center justify-center py-8">
            <Skeleton className="h-8 w-32" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
