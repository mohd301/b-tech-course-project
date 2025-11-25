import { getUserType } from "./getUserType";
import { determineRoute } from "./determineRoute";

export function alertAuth(navigate) {
    const type=getUserType();
    if(!type) return;
    const route = determineRoute(type)
    const msg = "You are already authenticated as " + type + ". Redirecting to your home page";

    alert(msg);
    navigate(route, { replace: true });
}