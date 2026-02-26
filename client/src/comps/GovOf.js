import Maps from "../compsMisc/Map"
import { Card, CardBody, CardTitle, Container, Label } from "reactstrap"
import { useTheme } from "../compsMisc/ThemeContext"

export default function GovOf() {
    const {theme }= useTheme()
    return (
        <>
            <Container fluid>
                <div style={{  minHeight: "82.1vh" }}>
                    <div className="d-flex justify-content-center align-items-center">
                        <Card style={{background:theme.primaryBackground,borderColor: theme.secondaryColor, minHeight: "68vh", width: "50vw", borderRadius: "6vh" }}
                        className="d-flex justify-content-center border-3 mt-4 mb-4">
                            
                            <CardTitle className="p-4 d-flex container-fuild">
                            <Label className="text-center" style={{color:theme.textColorAlt}}>Map of govermemt offices</Label>
                            </CardTitle>
                            <CardBody className="d-flex justify-content-center mt-4 mb-4" style={{display:"flex",alignItems:"center"}}>
                              
                            <Maps />
                            
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </Container>
        </>
    )
}