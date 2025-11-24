import Logout from "../compsMisc/Logout";

export default function HomeAdmin() {

    return (
        <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
                <h3>Welcome Admin</h3>
                <Logout/>
        </div>
    )
}