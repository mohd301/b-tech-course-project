import { jwtDecode } from "jwt-decode";

export function getUserType(token) {
  const authToken = token || localStorage.getItem("authToken");
  if (!authToken) return null;

  try {
    const decoded = jwtDecode(authToken);
    return decoded.type
  } catch (err) {
    console.error("Invalid token:", err);
    return null;
  }
}