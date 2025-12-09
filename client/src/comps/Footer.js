import { Container,Col, Row } from "reactstrap";
import { colors } from "../styles/colors.js"

export default function Footer(){
    return(
        <>
    
        <Container fluid style={{background:colors.primaryColor,height:'10vh'}} className="p-4 text-center mt-2">
            <Row >
            <Col md="4"><h4 style={{color:"white"}}><u> Contact us </u></h4>
            </Col>
            <Col md="4">
            <h4 style={{color:"white"}}> &copy; Online Subsidy Eligibility System</h4>
            </Col>
            <Col md="4">
            <h4 style={{color:"white"}}><u> About us </u></h4>
            </Col>
            </Row>
        </Container>
        
        </>
    )
}