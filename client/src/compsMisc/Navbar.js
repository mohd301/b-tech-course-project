import { Container, Col, Row } from "reactstrap";
import { useDispatch, useSelector } from "react-redux"
import { FaUser } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaBell } from "react-icons/fa6";

import { getUserType } from "../functions/getUserType.js";
import { useTheme } from "./ThemeContext.js";
import { determineRoute } from "../functions/determineRoute.js";
import { fetchELInfoThunk } from "../slices/SlicePriv.js";

import Logout from "./Logout.js";


export default function Navbar() {
    const { theme } = useTheme();

    const type = getUserType();
    const route = determineRoute(type);
    const dispatch = useDispatch();

    useEffect(() => {
        if (type === "Regulator") {
            dispatch(fetchELInfoThunk())
        }
    }, [dispatch, type]);

    const elInfo = useSelector((state) => state.priv.elInfo)
    const frauds = elInfo.filter(el => el.Fraud === 1)

    return (
        <Container fluid style={{ background: theme.secondaryColor, minHeight: '5.75vh' }} className="d-flex gap-5 position-relative align-items-center justify-content-center">

            <div className="profileMenu" style={{ position: 'absolute', left: '1rem', fontSize: '1.5rem' }}>
                <div className="iconButton d-flex align-items-center justify-content-center">
                    <FaUser />
                </div>

                <div className="dropdownMenu">
                    <div >
                        <Link style={{ color: theme.textColorAlt }} to="changePwd">Change Password</Link>
                        <hr style={{ height: "0.15rem", border: "none", backgroundColor: theme.textColorAlt }} />
                        <Logout />
                    </div>
                </div>
            </div>

            {type === "Regulator" && frauds.length > 0 &&  // Notification bell
                <div className="profileMenu" style={{ position: 'absolute', right: '1rem', fontSize: '0.9rem' }}>
                    <div className="iconButton d-flex align-items-center justify-content-center">
                        <FaBell />
                    </div>

                    <div className="dropdownMenu p-2" style={{ position: 'absolute', right: '0.5rem' }}>
                        <div >
                            <p style={{ color: theme.textColorAlt }}>There are {frauds.length} Suspected Fraud Case(s)</p>
                        </div>
                    </div>
                </div>
            }

            <Link style={{ color: theme.textColor }} to={route}>Home</Link>

            {type === "User" &&
                <>
                    <Link style={{ color: theme.textColor }} to="/apply">Apply for Subsidy</Link>
                    <Link style={{ color: theme.textColor }} to="/userMap">Map</Link>
                </>
            }

            {type === "Admin" &&
                <>
                    <Link style={{ color: theme.textColor }} to="/manageUsers">Manage Users</Link>
                    <Link style={{ color: theme.textColor }} to="/manageDatasets">View Datasets</Link>
                    <Link style={{ color: theme.textColor }} to="/generateReport">Generate Report</Link>
                    <Link style={{ color: theme.textColor }} to="/audit">Audit Log</Link>
                </>
            }

            {type === "Regulator" &&
                <>
                    <Link style={{ color: theme.textColor }} to="/uploadDataset">Upload Dataset</Link>
                    <Link style={{ color: theme.textColor }} to="/manageDatasets">Manage Datasets</Link>
                </>
            }
        </Container>
    )
}