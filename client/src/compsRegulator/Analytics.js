
import { useEffect, useRef, useState, useCallback } from "react";
import { Accordion, AccordionHeader, AccordionItem, Card, CardBody, Form, CardFooter, Container, AccordionBody, Button, Col } from "reactstrap";
import { FaChartPie, FaTrash, FaChartBar, FaMap } from "react-icons/fa";
import Chart  from "chart.js/auto";

import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from "../compsMisc/ThemeContext";
import { fetchELAnalytics, fetchELAnalyticsMonthly } from "../slices/SlicePriv";
import { Responsive, useContainerWidth } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

// ─── Governorate coordinates (center points in Oman) ───────────────────────
const GOV_COORDS = {
    Muscat: [23.5880, 58.3829],
    Dhofar: [17.0151, 54.0924],
    Sur:    [22.5667, 59.5289],
    Nizwa:  [22.9333, 57.5333],
    Sohar:  [24.3647, 56.7450],
};

// ─── Aggregate governorate counts from an array of gov strings ─────────────
function getareanum(govArray) {
    const num = { Muscat: 15, Dhofar: 10, Sur: 10, Nizwa: 1, Sohar: 10 };
    if (!Array.isArray(govArray)) return num;
    govArray.forEach((gov) => {
        const key = gov === "muscat" ? "Muscat" : gov; // normalise lowercase "muscat"
        if (key in num) num[key] += 1;
    });
    return num;
}


// ─── Heatmap / bubble map using Leaflet ────────────────────────────────────
const MapCard = ({ theme, num, onRemove }) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const layersRef = useRef([]);

    useEffect(() => {
        // Dynamically load Leaflet CSS once
        if (!document.getElementById("leaflet-css")) {
            const link = document.createElement("link");
            link.id = "leaflet-css";
            link.rel = "stylesheet";
            link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
            document.head.appendChild(link);
        }

        let L;
        let cancelled = false;

        import("https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.esm.js")
            .catch(() => {
                // fallback: load via script tag
                return new Promise((res) => {
                    if (window.L) { res(window.L); return; }
                    const s = document.createElement("script");
                    s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
                    s.onload = () => res(window.L);
                    document.head.appendChild(s);
                });
            })
            .then((mod) => {
                if (cancelled) return;
                L = mod.default || mod;
                if (!mapRef.current) return;

                // Destroy previous instance if any
                if (mapInstance.current) {
                    mapInstance.current.remove();
                    mapInstance.current = null;
                }

                const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false })
                    .setView([22.5, 57.5], 6);

                L.tileLayer(
                    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
                    { attribution: '&copy; <a href="https://carto.com/">CARTO</a>', subdomains: "abcd", maxZoom: 19 }
                ).addTo(map);

                mapInstance.current = map;
                layersRef.current = [];
 
                const maxVal = Math.max(...Object.values(num), 1);
 
                // Interpolate between cold (blue) → warm (red) based on count ratio
                function heatColor(ratio) {
                    // 0 = cold blue, 0.5 = yellow, 1 = hot red
                    const r = Math.round(255 * Math.min(1, ratio * 2));
                    const g = Math.round(255 * Math.min(1, 2 - ratio * 2));
                    const b = Math.round(50 * (1 - ratio));
                    return `rgb(${r},${g},${b})`;
                }
 
                Object.entries(GOV_COORDS).forEach(([name, coords]) => {
                    const count = num[name] || 0;
                    const ratio = count / maxVal;
                    const radius = 20;
                    const color = heatColor(ratio);
 
                    const circle = L.circleMarker(coords, {
                        radius,
                        fillColor: color,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [num, theme]);

    return (
        <Card style={{ background: theme.altBackground, color: theme.textColor }} className="h-100 w-100 d-flex flex-column shadow-sm">
            <div className="drag-handle" style={{ height: "15px", background: theme.altBackground, cursor: "grab", textAlign: "center", fontSize: "10px" }}>⠿⠿⠿</div>
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

// ─── Regular chart card ─────────────────────────────────────────────────────
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
        return () => { if (chartInstance.current) chartInstance.current.destroy(); };
    }, [data, theme, type]);

    return (
        <Card style={{ background: theme.altBackground, color: theme.textColor }} className="h-100 w-100 d-flex flex-column shadow-sm">
            <div className="drag-handle" style={{ height: "15px", background: theme.altBackground, cursor: "grab", textAlign: "center", fontSize: "10px" }}>⠿⠿⠿</div>
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

// ─── Main Analytics component ───────────────────────────────────────────────
export default function Analytics() {
    const { theme } = useTheme();
    const dispatch = useDispatch();
    const [open, setOpen] = useState("1");
    const { width, containerRef } = useContainerWidth();
    const [charts, setCharts] = useState([]);
    
    const toggle = (id) => setOpen(open === id ? undefined : id);

    const analyti = useSelector((state) => state.priv.analytic);
    const monthlyData = useSelector(state => state.priv.manalytis || []);
    console.log(analyti)
    const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

 function months(config) {
  var cfg = config || {};
  var count = cfg.count || 12;
  var section = cfg.section;
  var values = [];
  var i, value;

  for (i = 0; i < count; ++i) {
    value = MONTHS[Math.ceil(i) % 12];
    values.push(value.substring(0, section));
  }

  return values;
}

    useEffect(() => {
        dispatch(fetchELAnalytics());
        dispatch(fetchELAnalyticsMonthly());
    }, [dispatch]);

    // analyti.gov is expected to be an array of governorate strings
    const areaNum = getareanum(analyti.gov);
    const fruadpie = {
        labels:["Fraud","not Fruad"],
        datasets: [{ data: [analyti.fraudCount || 0, (analyti.ineligibleCount || 0)+ (analyti.eligibleCount|| 0)], backgroundColor: [theme.sus, theme.primaryColor] }],
    }
    const pieData = {
        labels: ["Eligible", "Ineligible"],
        datasets: [{ data: [analyti.eligibleCount || 0, analyti.ineligibleCount || 0], backgroundColor: [theme.primaryColor, theme.secondaryColor] }],
    };
    const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const labels = monthlyData.map(d => `${MONTH_NAMES[d._id.month - 1]} ${d._id.year}`);

const lineData = {
    labels: labels,
    datasets: [{ 
        label: [labels], 
        data: monthlyData.map(d => (d.eligibleCount || 0) + (d.ineligibleCount || 0)), 
        backgroundColor: [theme.primaryColor] 
    }],
    Fill: false
};
    const barData1 = {
        labels: ["Muscat", "Dhofar", "Sur", "Nizwa", "Sohar"],
        datasets: [{
            label: "Entries",
            data: [areaNum.Muscat ||0, areaNum.Dhofar, areaNum.Sur, areaNum.Nizwa, areaNum.Sohar],
            backgroundColor: [theme.primaryColor],
        }],
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

    const initialLayouts = {
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
    };

    const [layouts, setLayouts] = useState(initialLayouts);
    const handleLayoutChange = useCallback((_, allLayouts) => setLayouts(allLayouts), []);

    const chartOptions = [
        { chartname: "chart1", charttitle: "Eligibility Distribution", type: "doughnut", data: pieData },
        { chartname: "chart2", charttitle: "Total Sumbimitions", type: "line", data: lineData },
        { chartname: "chart3", charttitle: "Entries by Area", type: "bar", data: barData1 },
        { chartname: "chartMap", charttitle: "Map Heatmap", type: "map" },
         { chartname: "chart4", charttitle: "Fruad Distrubion", type: "doughnut", data: fruadpie },
    ];

    return (
        <Container fluid>
            <Form>
                <Accordion open={open} toggle={toggle} style={{ background: theme.altBackground }}>
                    <AccordionItem style={{ background: theme.altBackground }}>
                        <AccordionHeader style={{ background: theme.altBackground }} targetId="1">Pick your chart</AccordionHeader>
                        <AccordionBody style={{ background: theme.altBackground }} targetId="1">
                            <Col xs="12" className="d-flex flex-wrap gap-2">
                                <Button onClick={() => addChart(chartOptions[0])}>
                                    <FaChartPie /> Eligibility
                                </Button>
                                <Button onClick={() => addChart(chartOptions[1])}>
                                    <FaChartBar /> Total Entries
                                </Button>
                                <Button onClick={() => addChart(chartOptions[2])}>
                                    <FaChartBar /> By Area
                                </Button>
                                <Button onClick={() => addChart(chartOptions[3])}>
                                    <FaMap /> Area Map
                                </Button>
                                <Button onClick={() => addChart(chartOptions[4])}>
                                    <FaChartPie /> Fruad
                                </Button>
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
                    {charts.map((c) => (
                        <div key={c.chartname}>
                            {c.type === "map" ? (
                                <MapCard
                                    theme={theme}
                                    num={areaNum}
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