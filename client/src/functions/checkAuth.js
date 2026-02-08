import { alertAuth } from "./alertAuth";

export function checkAuth(alertedRef, navigate) {
    const localToken = localStorage.getItem("authToken")
    // Prevent authenticated user from logging in again
    if (localToken && !alertedRef.current) {
        // Prevent multiple alerts
        alertedRef.current = true;
        alertAuth(navigate);
    }
}