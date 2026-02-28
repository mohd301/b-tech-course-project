import { Button, Container, Form, Input, Label, Table } from "reactstrap"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"

import { fetchAuditLogsThunk } from "../slices/SlicePriv"
import { useTheme } from "../compsMisc/ThemeContext"

import CenteredSpinner from "../compsMisc/CenteredSpinner"

export default function AuditLog() {
    const { theme } = useTheme();
    const dispatch = useDispatch();
    const logs = useSelector((state) => state.priv.auditLogs);
    const loading = useSelector((state) => state.priv.loading);

    useEffect(() => {
        dispatch(fetchAuditLogsThunk());
    }, [dispatch]);

    return (
        <Container className="py-4" style={{ minHeight: "80vh" }}>
            <Container className="d-flex justify-content-center align-items-center">
                <Container style={{ height: "100%" }}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 style={{ color: theme.textColorAlt }}>Audit Log</h2>
                    </div>

                    {loading ? (
                        <CenteredSpinner color={theme.primaryColor} />
                    ) : (
                        <div className="table-wrapper">
                            <Table className="user-table" responsive>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Actor ID</th>
                                        <th>Action</th>
                                        <th>Target Type</th>
                                        <th>Target ID</th>
                                        <th>Changes</th>
                                        <th>Metadata</th>
                                        <th>IP</th>
                                        <th>Result</th>
                                        <th>Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        logs.map((log, index) => {
                                            return (
                                                <tr key={log._id}>
                                                    <td>{index + 1}</td>
                                                    <td>{log.actorId}</td>
                                                    <td>{log.action}</td>
                                                    <td>{log.targetType}</td>
                                                    <td>{log.targetId}</td>
                                                    <td className="nowrap">
                                                        {log.changes
                                                            ? Object.entries(log.changes).map(([field, vals]) => (
                                                                <div key={field}>
                                                                    {field}: {JSON.stringify(vals)}
                                                                </div>
                                                            ))
                                                            : "-"}
                                                    </td>
                                                    <td className="nowrap">
                                                        <div>
                                                            Route: "{log.metadata.route}"<br />Method: "{log.metadata.method}"
                                                        </div>
                                                    </td>
                                                    <td>{log.ip}</td>
                                                    {log.result === "success" ? (
                                                        <td style={{ color: theme.primaryColor }}>{log.result}</td>
                                                    ) : (
                                                        <td style={{ color: theme.secondaryColor }}>{log.result}</td>
                                                    )
                                                    }
                                                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </Table>
                        </div>
                    )

                    }
                </Container>
            </Container>
        </Container>
    )
}