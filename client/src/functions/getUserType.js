import { jwtDecode } from "jwt-decode";

export function getUserType() {
  const token = localStorage.getItem("authToken");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded.type
  } catch (err) {
    console.error("Invalid token:", err);
    return null;
  }
}