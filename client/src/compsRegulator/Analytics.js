
import { useEffect, useRef, useState, useCallback } from "react";
import { Accordion, AccordionHeader, AccordionItem, Card, CardBody, Form, CardFooter, Container, AccordionBody, Button, Col } from "reactstrap";
import { FaChartPie, FaTrash ,FaChartBar } from "react-icons/fa";
import Chart from "chart.js/auto";
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from "../compsMisc/ThemeContext";
import { fetchELAnalytics } from "../slices/SlicePriv";
import { Responsive, useContainerWidth } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ChartCard = ({ title, type, data, theme, onRemove }) => {
    const canvasRef = useRef(null);
    const chartInstance = useRef(null);
    
    useEffect(() => {
        if (canvasRef.current && data) {
            if (chartInstance.current) chartInstance.current.destroy();
            const ctx = canvasRef.current.getContext('2d');
            chartInstance.current = new Chart(ctx, {
                type,
                data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } }
                }
            });
        }
        return () => { if (chartInstance.current) chartInstance.current.destroy(); };
    }, [data, theme, type]);

    return (
        <Card style={{ background:theme.altBackground,color:theme.textColor}} className="h-100 w-100 d-flex flex-column shadow-sm">
            <div className="drag-handle" style={{ height: '15px', background: theme.altBackground, cursor: 'grab', textAlign: 'center', fontSize: '10px' }}>⠿⠿⠿</div>
            <CardBody className="flex-grow-1 p-2" style={{ position: 'relative', minHeight: '0' }}>
                <canvas ref={canvasRef} />
            </CardBody>
            <CardFooter className="py-1 text-center">
                <small>{title}</small>
                {onRemove && <Button size="sm" className="ms-2" onClick={onRemove}><FaTrash /></Button>}
            </CardFooter>
            
        </Card>
    );
};

export default function Analytics() {
    const { theme } = useTheme();
    const dispatch = useDispatch();
    const [open, setOpen] = useState('1');
    const { width, containerRef } = useContainerWidth();

    
    const [charts, setCharts] = useState([]);

    const toggle = (id) => setOpen(open === id ? undefined : id);

    const analyti = useSelector((state) => state.priv.analytic);
    console.log(getareanum(analyti.gov))
    useEffect(() => {
        dispatch(fetchELAnalytics());
    }, [dispatch]);

    const pieData = {
        labels: ['Eligible', 'Ineligible'],
        datasets: [{ data: [analyti.eligibleCount || 0, analyti.ineligibleCount || 0], backgroundColor: [theme.primaryColor, theme.secondaryColor] }]
    };
    const barData = {
        labels: ['Total records'],
        datasets: [{ label: 'Counts', data: [(analyti.eligibleCount || 0) + (analyti.ineligibleCount || 0)], backgroundColor: [theme.primaryColor] }]
    };
    const barData1 = {
        labels: ['Total entries by area'],
        datasets: [{ label: 'Counts', data: [getareanum(analyti.gov).Muscat || 0,getareanum(analyti.gov).Dhofar || 0,getareanum(analyti.gov).Sur || 0,getareanum(analyti.gov).Nizwa || 0,getareanum(analyti.gov).Sohar || 0], backgroundColor: [theme.primaryColor] }]
    };

    
    const addChart = (newChart) => {
        setCharts(prev => {
            const alreadyAdded = prev.some(c => c.chartname === newChart.chartname);
            if (alreadyAdded) return prev;
            return [...prev, newChart];
        });
    };

    const removeChart = (chartname) => {
        setCharts(prev => prev.filter(c => c.chartname !== chartname));
    };

    const initialLayouts = {
        md: [
            { i: 'chart1', x: 0, y: 0, w: 20, h: 20, minW: 5, minH: 5 },
            { i: 'chart2', x: 1, y: 0, w: 3, h: 7, minW: 2, minH: 5 },
            { i: 'chart3', x: 0, y: 8, w: 3, h: 7, minW: 2, minH: 5 }
        ],
        sm: [
            { i: 'chart1', x: 0, y: 0, w: 20, h: 20, minW: 3, minH: 5 },
            { i: 'chart2', x: 4, y: 0, w: 6, h: 6, minW: 2, minH: 5 },
            { i: 'chart3', x: 0, y: 8, w: 6, h: 6, minW: 2, minH: 5 }
        ]
    };

    const [layouts, setLayouts] = useState(initialLayouts);
    const handleLayoutChange = useCallback((_, allLayouts) => setLayouts(allLayouts), []);

    const chartOptions = [
        { chartname: 'chart1', charttitle: "Eligibility Distribution", type: 'doughnut', data: pieData },
        { chartname: 'chart2', charttitle: "Total Entries", type: 'bar', data: barData },
        { chartname: 'chart3', charttitle: "Entries by Area", type: 'bar', data: barData1 },
    ];
    function getareanum(gov){
        const num={}
        if (gov==="muscat"){
            num["Muscat"]=+1
        }
        else if(gov==="Nizwa"){
            num["Nizwa"]=+1
        }else if(gov==="Sohar"){
            num['Sohar']=+1
        }else if(gov==="Sur"){
            num["Sur"]=+1
        }else if(gov==="Dhofar"){
            num["Dhofar"]=+1
        }
        return num
    }
    
    return (
        <Container fluid>
            <Form>
                <Accordion open={open} toggle={toggle} style={{background:theme.altBackground}}>
                    <AccordionItem style={{background:theme.altBackground}}>
                        <AccordionHeader style={{background:theme.altBackground}} targetId="1">Pick your chart</AccordionHeader>
                        <AccordionBody style={{background:theme.altBackground}} targetId="1">
                            <Col xs="3">
                                
                                <Button onClick={() => addChart(chartOptions[0])}>
                                    <FaChartPie /> Eligibility
                                </Button>
                                <Button className="ms-2" onClick={() => addChart(chartOptions[1])}>
                                    <FaChartBar /> Total Entries
                                </Button>
                                <Button className="ms-2" onClick={() => addChart(chartOptions[2])}>
                                    <FaChartBar /> By Area
                                </Button>
                            </Col>
                        </AccordionBody>
                    </AccordionItem>
                </Accordion>
            </Form>

            <div ref={containerRef} style={{ background: theme.background, padding: '10px', borderRadius: '4px' }}>
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
                    {/* ✅ Fix 4: correct condition and return inside map */}
                    {charts.map((c) => (
                        <div key={c.chartname}>
                            <ChartCard
                                title={c.charttitle}
                                type={c.type}
                                data={c.data}
                                theme={theme}
                                onRemove={() => removeChart(c.chartname)}
                            />
                        </div>
                    ))}
                </Responsive>
            </div>
        </Container>
    );
}