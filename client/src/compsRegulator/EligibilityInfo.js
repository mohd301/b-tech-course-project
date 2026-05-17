import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "../compsMisc/ThemeContext";
import { toast } from "react-toastify";

import { fetchAggregatedUserInfo } from "../slices/SlicePriv";
import { deleteUserEligibilityThunk } from "../slices/SlicePriv";

import CenteredSpinner from "../compsMisc/CenteredSpinner"

const EligibilityInfo = () => {
    const { theme } = useTheme()
    const dispatch = useDispatch();
    const [search, setSearch] = useState("");

    const { userEligibility, loading } = useSelector((state) => state.priv);

    useEffect(() => {
        dispatch(fetchAggregatedUserInfo());
    }, []);

    // Split and filter data
    const eligibleUsers =
        userEligibility?.filter((u) =>
            u.eligibilityInfo?.Eligibility === 1 &&
            u.eligibilityInfo?.NationalID?.toLowerCase().includes(search.toLowerCase())
        ) || [];

    const fraudUsers =
        userEligibility?.filter((u) =>
            (u.Fraud > 0 || u.eligibilityInfo?.Fraud > 0) &&
            u.eligibilityInfo?.NationalID?.toLowerCase().includes(search.toLowerCase())
        ) || [];

    const handleDelete = async (_id) => {
        try {
            await dispatch(deleteUserEligibilityThunk(_id)).unwrap();
            toast.success("Fraud Case Dismissed Successfully");
            dispatch(fetchAggregatedUserInfo());
        } catch (err) {
            toast.error("Failed to delete user");
        }
    };

    return (
        <div className="d-flex" style={{ background: theme.primaryBackground, minHeight: "82.1vh" }}>

            <div className="floatingSearch">
                <input className="floatingSearchInput" type="text" placeholder="Search by National ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            {/* LEFT - Eligible */}
            <div
                style={{
                    flex: 1,
                    padding: "20px",
                    borderRight: `2px solid ${theme.bgGray}`,
                    overflowY: "auto",
                }}>
                <h2 style={{ color: theme.primaryColor }}>Eligible Users</h2>

                {loading ? (
                    <CenteredSpinner color={theme.primaryColor} />
                ) : eligibleUsers.length === 0 ? (
                    <p style={{ color: theme.textColorAlt }}>No eligible users</p>
                ) : (
                    eligibleUsers.map((user, idx) => (
                        <div key={idx} style={{
                            background: theme.altBackground,
                            padding: "15px",
                            marginBottom: "10px",
                            borderRadius: "10px",
                            boxShadow: `0 2px 5px ${theme.shadowColor}`,
                            borderLeft: `5px solid ${theme.primaryColor}`,
                        }}>
                            <p style={{ color: theme.textColorAlt }}><strong>Email:</strong> {user.Email}</p>
                            <p style={{ color: theme.textColorAlt }}><strong>Phone:</strong> {user.Phone}</p>
                            <p style={{ color: theme.textColorAlt }}><strong>National ID:</strong> {user.eligibilityInfo?.NationalID}</p>
                        </div>
                    ))
                )}
            </div>

            {/* RIGHT - Fraud */}
            <div style={{
                flex: 1,
                padding: "20px",
                overflowY: "auto",
            }}>
                <h2 style={{ color: theme.sus }}>Potential Fraud Cases</h2>

                {loading ? (
                    <CenteredSpinner color={theme.primaryColor} />
                ) : fraudUsers.length === 0 ? (
                    <p style={{ color: theme.textColorAlt }}>No fraud cases</p>
                ) : (
                    fraudUsers.map((user, idx) => (
                        <div key={idx} style={{
                            background: theme.altBackground,
                            padding: "15px",
                            marginBottom: "10px",
                            borderRadius: "10px",
                            boxShadow: `0 2px 5px ${theme.shadowColor}`,
                            borderLeft: `5px solid ${theme.sus}`,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start"
                        }}>

                            <div style={{ borderRight: `2px solid ${theme.bgGray}`, width: "50%" }}>
                                <p style={{ color: theme.textColorAlt }}><strong>Email:</strong> {user.Email}</p>
                                <p style={{ color: theme.textColorAlt }}><strong>Phone:</strong> {user.Phone}</p>
                                <p style={{ color: theme.textColorAlt }}><strong>National ID:</strong> {user.eligibilityInfo?.NationalID}</p>
                                {user.eligibilityInfo?.Reason && (
                                    <p style={{ color: theme.textColorAlt }}><strong>Reason:</strong> {user.eligibilityInfo.Reason}</p>
                                )}
                            </div>

                            <div>
                                <button
                                    className="simpleButton p-1"
                                    onClick={() => handleDelete(user.eligibilityInfo._id)}
                                    style={{
                                        color: theme.textColorAlt,
                                        backgroundColor: theme.secondaryColor,
                                        border: "1px solid",
                                        borderRadius: "4px",
                                    }}>
                                    Dismiss
                                </button>
                            </div>

                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default EligibilityInfo;