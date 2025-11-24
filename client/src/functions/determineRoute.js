export function determineRoute(type) {
    try {
        let route = ""
        switch (type) {
            case "Admin": route = "/homeAdmin"; break;
            case "Regulator": route = "/homeReg"; break;
            case "User": route = "/home"; break;
        }
        return route
    } catch (err) {
        console.error("error determining Route", err);
        return null;
    }
}