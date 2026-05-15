import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Accordion, AccordionHeader, AccordionItem, Card, CardBody, Form, CardFooter, Container, AccordionBody, Button, Col, Table } from "reactstrap";
import { FaChartPie, FaTrash, FaChartBar, FaMap, FaClipboardList } from "react-icons/fa";
import Chart from "chart.js/auto";

import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "../compsMisc/ThemeContext";
import { fetchAuditLogsThunk, fetchELAnalytics, fetchELAnalyticsMonthly } from "../slices/SlicePriv";
import { getUserType } from "../functions/getUserType";
import { Responsive, useContainerWidth } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const GOV_COORDS = {
    Muscat: [23.5880, 58.3829],
    Dhofar: [17.0151, 54.0924],
    Sur: [22.5667, 59.5289],
    Nizwa: [22.9333, 57.5333],
    Sohar: [24.3647, 56.7450],
};

const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

function getAreaNum(govArray) {
    const num = { Muscat: 15, Dhofar: 10, Sur: 10, Nizwa: 1, Sohar: 10 };
    if (!Array.isArray(govArray)) return num;

    govArray.forEach((gov) => {
        const key = gov === "muscat" ? "Muscat" : gov;
        if (key in num) num[key] += 1;
    });

    return num;
}

function months(config) {
    const cfg = config || {};
    const count = cfg.count || 12;
    const section = cfg.section;
    const values = [];

    for (let i = 0; i < count; i += 1) {
        const value = MONTHS[i % 12];
        values.push(section ? value.substring(0, section) : value);
    }

    return values;
}

function countBy(items, resolver) {
    return items.reduce((counts, item) => {
        const key = resolver(item) || "Unknown";
        counts[key] = (counts[key] || 0) + 1;
        return counts;
    }, {});
}

function topCounts(counts, limit = 8) {
    const entries = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit);

    if (entries.length === 0) {
        return { labels: ["No data"], values: [0] };
    }

    return {
        labels: entries.map(([label]) => label),
        values: entries.map(([, value]) => value),
    };
}

function buildAuditActivity(logs, dayCount = 7) {
    const today = new Date();
    const days = Array.from({ length: dayCount }, (_, index) => {
        const date = new Date(today);
        date.setDate(today.getDate() - (dayCount - 1 - index));

        return {
            key: date.toISOString().slice(0, 10),
            label: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
            count: 0,
        };
    });

    const dayMap = days.reduce((map, day) => {
        map[day.key] = day;
        return map;
    }, {});

    logs.forEach((log) => {
        if (!log.createdAt) return;
        const key = new Date(log.createdAt).toISOString().slice(0, 10);
        if (dayMap[key]) dayMap[key].count += 1;
    });

    return {
        labels: days.map((day) => day.label),
        values: days.map((day) => day.count),
    };
}

const MapCard = ({ theme, num, onRemove }) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const layersRef = useRef([]);

    useEffect(() => {
        if (!document.getElementById("leaflet-css")) {
            const link = document.createElement("link");
            link.id = "leaflet-css";
            link.rel = "stylesheet";
            link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
            document.head.appendChild(link);
        }

        let cancelled = false;

        new Promise((res, rej) => {
            if (window.L) {
                res(window.L);
                return;
            }

            const existingScript = document.getElementById("leaflet-js");
            if (existingScript) {
                existingScript.addEventListener("load", () => res(window.L), { once: true });
                existingScript.addEventListener("error", rej, { once: true });
                return;
            }

            const script = document.createElement("script");
            script.id = "leaflet-js";
            script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
            script.onload = () => res(window.L);
            script.onerror = rej;
            document.head.appendChild(script);
        })
            .then((L) => {
                if (window.L) {
                    return window.L;
                }

                if (L) {
                    return L;
                }

                throw new Error("Leaflet failed to load");
            })
            .then((L) => {
                if (cancelled) {
                    return;
                }

                if (!mapRef.current) return;

                if (mapInstance.current) {
                    mapInstance.current.remove();
                    mapInstance.current = null;
                }

                const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false })
                    .setView([22.5, 57.5], 6);

                L.tileLayer(
                    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
                    { attribution: "&copy; CARTO", subdomains: "abcd", maxZoom: 19 }
                ).addTo(map);

                mapInstance.current = map;
                layersRef.current = [];

                const maxVal = Math.max(...Object.values(num), 1);

                function heatColor(ratio) {
                    const r = Math.round(255 * Math.min(1, ratio * 2));
                    const g = Math.round(255 * Math.min(1, 2 - ratio * 2));
                    const b = Math.round(50 * (1 - ratio));
                    return `rgb(${r},${g},${b})`;
                }

                Object.entries(GOV_COORDS).forEach(([name, coords]) => {
                    const count = num[name] || 0;
                    const ratio = count / maxVal;

                    const circle = L.circleMarker(coords, {
                        radius: 20,
                        fillColor: heatColor(ratio),
                        color: "#fff",
                        weight: 1.5,
                        opacity: 0.9,
                        fillOpacity: 0.8,
                    })
                        .bindTooltip(`<strong>${name}</strong><br/>Entries: ${count}`, { direction: "top" })
                        .addTo(map);

                    layersRef.current.push(circle);
                });
            });

        return () => {
            cancelled = true;
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, [num]);

    return (
        <Card style={{ background: theme.altBackground, color: theme.textColor }} className="h-100 w-100 d-flex flex-column shadow-sm">
            <div className="drag-handle" style={{ height: "15px", background: theme.altBackground, cursor: "grab", textAlign: "center", fontSize: "10px" }}>...</div>
            <CardBody className="flex-grow-1 p-0" style={{ position: "relative", minHeight: "0" }}>
                <div ref={mapRef} style={{ height: "100%", width: "100%", minHeight: "200px" }} />
            </CardBody>
            <CardFooter className="py-1 text-center">
                <small>Entries by Governorate (Map)</small>
                {onRemove && (
                    <Button size="sm" className="ms-2" onClick={onRemove}>
                        <FaTrash />
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
};

const ChartCard = ({ title, type, data, theme, onRemove }) => {
    const canvasRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (canvasRef.current && data) {
            if (chartInstance.current) chartInstance.current.destroy();
            const ctx = canvasRef.current.getContext("2d");
            chartInstance.current = new Chart(ctx, {
                type,
                data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: "bottom" } },
                },
            });
        }

        return () => {
            if (chartInstance.current) chartInstance.current.destroy();
        };
    }, [data, theme, type]);

    return (
        <Card style={{ background: theme.altBackground, color: theme.textColor }} className="h-100 w-100 d-flex flex-column shadow-sm">
            <div className="drag-handle" style={{ height: "15px", background: theme.altBackground, cursor: "grab", textAlign: "center", fontSize: "10px" }}>...</div>
            <CardBody className="flex-grow-1 p-2" style={{ position: "relative", minHeight: "0" }}>
                <canvas ref={canvasRef} />
            </CardBody>
            <CardFooter className="py-1 text-center">
                <small>{title}</small>
                {onRemove && (
                    <Button size="sm" className="ms-2" onClick={onRemove}>
                        <FaTrash />
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
};

const AuditLogCard = ({ logs, theme, onRemove }) => {
    const recentLogs = logs.slice(0, 6);

    return (
        <Card style={{ background: theme.altBackground, color: theme.textColor }} className="h-100 w-100 d-flex flex-column shadow-sm">
            <div className="drag-handle" style={{ height: "15px", background: theme.altBackground, cursor: "grab", textAlign: "center", fontSize: "10px" }}>...</div>
            <CardBody className="flex-grow-1 p-2" style={{ overflow: "auto" }}>
                <Table size="sm" className="mb-0 user-table">
                    <thead>
                        <tr>
                            <th>Action</th>
                            <th>Actor</th>
                            <th>Result</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentLogs.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center">No audit logs found</td>
                            </tr>
                        ) : recentLogs.map((log) => (
                            <tr key={log._id}>
                                <td>{log.action}</td>
                                <td>{log.actorId}</td>
                                <td style={{ color: log.result === "success" ? theme.primaryColor : theme.secondaryColor }}>
                                    {log.result}
                                </td>
                                <td>{log.createdAt ? new Date(log.createdAt).toLocaleString() : "-"}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </CardBody>
            <CardFooter className="py-1 text-center">
                <small>Recent Audit Log</small>
                {onRemove && (
                    <Button size="sm" className="ms-2" onClick={onRemove}>
                        <FaTrash />
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
};

export default function Analytics({ context }) {
    const { theme } = useTheme();
    const dispatch = useDispatch();
    const type = context || getUserType();
    const isAdmin = type === "Admin";
    const [open, setOpen] = useState("1");
    const { width, containerRef } = useContainerWidth();
    const [charts, setCharts] = useState([]);
    
    const toggle = (id) => setOpen(open === id ? undefined : id);

    const analyti = useSelector((state) => state.priv.analytic || {});
    const monthlyData = useSelector((state) => state.priv.manalytis || []);
    const auditLogs = useSelector((state) => state.priv.auditLogs || []);
    const logs = Array.isArray(auditLogs) ? auditLogs : [];

    useEffect(() => {
        if (isAdmin) {
            dispatch(fetchAuditLogsThunk());
        } else {
            dispatch(fetchELAnalytics());
            dispatch(fetchELAnalyticsMonthly());
        }
        setCharts([]);
    }, [dispatch, isAdmin]);

    const areaNum = getAreaNum(analyti.gov);
    const totalApplicants = analyti.totalApplicants || 0;
    const eligibleCount = analyti.eligibleCount || 0;
    const ineligibleCount = analyti.ineligibleCount || 0;
    const fraudCount = analyti.fraudCount || 0;
    const labels = months({ count: 7, section: 3 });

    const pieData = {
        labels: ["Eligible", "Ineligible"],
        datasets: [{ data: [eligibleCount, ineligibleCount], backgroundColor: [theme.primaryColor, theme.secondaryColor] }],
    };
    const fraudPie = {
        labels: ["Fraud", "Not Fraud"],
        datasets: [{ data: [fraudCount, Math.max(totalApplicants - fraudCount, 0)], backgroundColor: [theme.sus, theme.primaryColor] }],
    };
    const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const submissionLabels = monthlyData.length
        ? monthlyData.map(d => `${MONTH_NAMES[d._id.month - 1]} ${d._id.year}`)
        : labels;
    const lineData = {
        labels: submissionLabels,
        datasets: [{
            label: "Submissions",
            data: monthlyData.length
                ? monthlyData.map(d => (d.eligibleCount || 0) + (d.ineligibleCount || 0))
                : labels.map((_, index) => (index === labels.length - 1 ? totalApplicants : 0)),
            borderColor: theme.primaryColor,
            backgroundColor: theme.primaryColor
        }],
    };
    const barData1 = {
        labels: ["Muscat", "Dhofar", "Sur", "Nizwa", "Sohar"],
        datasets: [{
            label: "Entries",
            data: [areaNum.Muscat ||0, areaNum.Dhofar, areaNum.Sur, areaNum.Nizwa, areaNum.Sohar],
            backgroundColor: [theme.primaryColor],
        }],
    };

    const successCount = logs.filter((log) => log.result === "success").length;
    const failureCount = logs.length - successCount;
    const actionCounts = topCounts(countBy(logs, (log) => log.action));
    const methodCounts = topCounts(countBy(logs, (log) => log.metadata?.method));
    const targetCounts = topCounts(countBy(logs, (log) => log.targetType));
    const auditActivity = buildAuditActivity(logs);

    const auditResultsData = {
        labels: ["Success", "Failure"],
        datasets: [{ data: [successCount, failureCount], backgroundColor: [theme.primaryColor, theme.secondaryColor] }],
    };
    const auditActionsData = {
        labels: actionCounts.labels,
        datasets: [{ label: "Audit Events", data: actionCounts.values, backgroundColor: [theme.primaryColor] }],
    };
    const auditActivityData = {
        labels: auditActivity.labels,
        datasets: [{ label: "Audit Events", data: auditActivity.values, borderColor: theme.primaryColor, backgroundColor: theme.primaryColor }],
    };
    const auditMethodsData = {
        labels: methodCounts.labels,
        datasets: [{ label: "Requests", data: methodCounts.values, backgroundColor: [theme.secondaryColor] }],
    };
    const auditTargetsData = {
        labels: targetCounts.labels,
        datasets: [{ label: "Targets", data: targetCounts.values, backgroundColor: [theme.primaryColor] }],
    };

    const addChart = (newChart) => {
        setCharts((prev) => {
            if (prev.some((c) => c.chartname === newChart.chartname)) return prev;
            return [...prev, newChart];
        });
    };

    const removeChart = (chartname) => {
        setCharts((prev) => prev.filter((c) => c.chartname !== chartname));
    };

    const initialLayouts = useMemo(() => isAdmin ? {
        md: [
            { i: "auditResults", x: 0, y: 0, w: 4, h: 10, minW: 3, minH: 5 },
            { i: "auditActions", x: 4, y: 0, w: 4, h: 10, minW: 2, minH: 5 },
            { i: "auditActivity", x: 8, y: 0, w: 4, h: 10, minW: 2, minH: 5 },
            { i: "auditMethods", x: 0, y: 10, w: 4, h: 10, minW: 2, minH: 5 },
            { i: "auditTargets", x: 4, y: 10, w: 4, h: 10, minW: 2, minH: 5 },
            { i: "auditLog", x: 0, y: 20, w: 8, h: 14, minW: 4, minH: 8 },
        ],
        sm: [
            { i: "auditResults", x: 0, y: 0, w: 6, h: 10, minW: 3, minH: 5 },
            { i: "auditActions", x: 6, y: 0, w: 6, h: 10, minW: 2, minH: 5 },
            { i: "auditActivity", x: 0, y: 10, w: 6, h: 10, minW: 2, minH: 5 },
            { i: "auditMethods", x: 6, y: 10, w: 6, h: 10, minW: 2, minH: 5 },
            { i: "auditTargets", x: 0, y: 20, w: 6, h: 10, minW: 2, minH: 5 },
            { i: "auditLog", x: 0, y: 30, w: 12, h: 14, minW: 4, minH: 8 },
        ],
    } : {
        md: [
            { i: "chart1", x: 0, y: 0, w: 4, h: 10, minW: 3, minH: 5 },
            { i: "chart2", x: 4, y: 0, w: 4, h: 10, minW: 2, minH: 5 },
            { i: "chart3", x: 8, y: 0, w: 4, h: 10, minW: 2, minH: 5 },
            { i: "chartMap", x: 0, y: 10, w: 8, h: 14, minW: 4, minH: 8 },
            { i: "chart4", x: 8, y: 0, w: 4, h: 10, minW: 2, minH: 5 },
        ],
        sm: [
            { i: "chart1", x: 0, y: 0, w: 6, h: 10, minW: 3, minH: 5 },
            { i: "chart2", x: 6, y: 0, w: 6, h: 10, minW: 2, minH: 5 },
            { i: "chart3", x: 0, y: 10, w: 6, h: 10, minW: 2, minH: 5 },
            { i: "chartMap", x: 0, y: 20, w: 12, h: 14, minW: 4, minH: 8 },
            { i: "chart4", x: 8, y: 0, w: 4, h: 10, minW: 2, minH: 5 },
        ],
    }, [isAdmin]);

    const [layouts, setLayouts] = useState(initialLayouts);
    const handleLayoutChange = useCallback((_, allLayouts) => setLayouts(allLayouts), []);

    useEffect(() => {
        setLayouts(initialLayouts);
    }, [initialLayouts]);

    const chartOptions = isAdmin ? [
        { chartname: "auditResults", charttitle: "Audit Results", type: "doughnut", data: auditResultsData, label: "Audit Results", icon: FaChartPie },
        { chartname: "auditActions", charttitle: "Actions by Type", type: "bar", data: auditActionsData, label: "Actions", icon: FaChartBar },
        { chartname: "auditActivity", charttitle: "Audit Activity", type: "line", data: auditActivityData, label: "Activity", icon: FaChartBar },
        { chartname: "auditMethods", charttitle: "Requests by Method", type: "bar", data: auditMethodsData, label: "Methods", icon: FaChartBar },
        { chartname: "auditTargets", charttitle: "Targets by Type", type: "bar", data: auditTargetsData, label: "Targets", icon: FaChartBar },
        { chartname: "auditLog", charttitle: "Recent Audit Log", type: "auditLog", label: "Audit Log", icon: FaClipboardList },
    ] : [
        { chartname: "chart1", charttitle: "Eligibility Distribution", type: "doughnut", data: pieData, label: "Eligibility", icon: FaChartPie },
        { chartname: "chart2", charttitle: "Total Submissions", type: "line", data: lineData, label: "Total Entries", icon: FaChartBar },
        { chartname: "chart3", charttitle: "Entries by Area", type: "bar", data: barData1, label: "By Area", icon: FaChartBar },
        { chartname: "chartMap", charttitle: "Map Heatmap", type: "map", label: "Area Map", icon: FaMap },
        { chartname: "chart4", charttitle: "Fraud Distribution", type: "doughnut", data: fraudPie, label: "Fraud", icon: FaChartPie },
    ];

    const renderedCharts = charts
        .map((chart) => chartOptions.find((option) => option.chartname === chart.chartname))
        .filter(Boolean)
        .filter((chart) => !isAdmin || chart.type !== "map");

    return (
        <Container fluid>
            <div className="d-flex justify-content-between align-items-center py-3">
                <h2 style={{ color: theme.textColorAlt }}>{isAdmin ? "Admin Analytics" : "Regulator Analytics"}</h2>
            </div>
            <Form>
                <Accordion open={open} toggle={toggle} style={{ background: theme.altBackground }}>
                    <AccordionItem style={{ background: theme.altBackground }}>
                        <AccordionHeader style={{ background: theme.altBackground }} targetId="1">Pick your chart</AccordionHeader>
                        <AccordionBody style={{ background: theme.altBackground }} targetId="1">
                            <Col xs="12" className="d-flex flex-wrap gap-2">
                                {chartOptions.map((option) => {
                                    const Icon = option.icon;
                                    return (
                                        <Button key={option.chartname} onClick={() => addChart(option)}>
                                            <Icon /> {option.label}
                                        </Button>
                                    );
                                })}
                            </Col>
                        </AccordionBody>
                    </AccordionItem>
                </Accordion>
            </Form>

            <div ref={containerRef} style={{ background: theme.background, padding: "10px", borderRadius: "4px" }}>
                <Responsive
                    width={width}
                    breakpoints={{ md: 960, sm: 720 }}
                    cols={{ md: 12, sm: 12 }}
                    rowHeight={30}
                    layouts={layouts}
                    onLayoutChange={handleLayoutChange}
                    draggableHandle=".drag-handle"
                    compactType="vertical"
                >
                    {renderedCharts.map((c) => (
                        <div key={c.chartname}>
                            {c.type === "map" ? (
                                <MapCard
                                    theme={theme}
                                    num={areaNum}
                                    onRemove={() => removeChart(c.chartname)}
                                />
                            ) : c.type === "auditLog" ? (
                                <AuditLogCard
                                    logs={logs}
                                    theme={theme}
                                    onRemove={() => removeChart(c.chartname)}
                                />
                            ) : (
                                <ChartCard
                                    title={c.charttitle}
                                    type={c.type}
                                    data={c.data}
                                    theme={theme}
                                    onRemove={() => removeChart(c.chartname)}
                                />
                            )}
                        </div>
                    ))}
                </Responsive>
            </div>
        </Container>
    );
}
