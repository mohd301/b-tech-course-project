import { Card, CardBody, CardFooter, Container, Row,Col } from "reactstrap"
import Chart from "chart.js/auto"
import plotly from 'plotly.js-dist'
import { useSelector, useDispatch } from 'react-redux'
import { useTheme } from "../compsMisc/ThemeContext"
import { useEffect,useRef } from "react"
import { fetchELAnalytics } from "../slices/SlicePriv"
export default function Analytics() {

    const {theme} = useTheme()
    const dispatch = useDispatch();
    useEffect(() => {
            dispatch(fetchELAnalytics());
        }, [dispatch]);
    const analyti = useSelector((state) => state.priv.analytic)
    useEffect(() => {
        
        if (chartRef.current) {
            
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }

            const ctx = chartRef.current.getContext('2d');

            chartInstance.current = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Eligible', 'Ineligible'],
                    datasets: [{
                        label: 'Eligibility Status',
                        data: [analyti.eligibleCount,  analyti.ineligibleCount ],
                        backgroundColor: [
                            theme.primaryColor , 
                            theme.secondaryColor 
                        ],
                        hoverOffset: 4
                    }]
                }
            });
        }return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [analyti, theme])
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    
    return (
        <>
            <Container fluid>
                <Row>
                    <Col xs='3'>
                    <Card><CardBody><canvas ref={chartRef} /></CardBody>
                    <CardFooter><p>
                        Eligibility pie chart</p></CardFooter></Card>
                    </Col>
                    
                </Row>
            </Container>
        </>
    )
}