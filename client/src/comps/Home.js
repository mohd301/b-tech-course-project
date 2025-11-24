import Logout from "../compsMisc/Logout";
export default function Home() {
    return (
        <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
            <h1> Welcome User </h1>
            <Logout/>
        </div>
    )
}