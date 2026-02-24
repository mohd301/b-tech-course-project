import Maps from "../compsMisc/Map"
import { Card, CardBody, CardTitle, Container, Label } from "reactstrap"
import { useTheme } from "../compsMisc/ThemeContext"

export default function GovOf() {
    const theme = useTheme()
    return (
        <>
            <Container fluid>
                <div style={{ background: theme.primaryBackground, minHeight: "82.1vh" }}>
                    <div className="d-flex justify-content-center align-items-center">
                        <Card style={{background: theme.tertiaryColor, minHeight: "68vh", width: "50vw", borderRadius: "6vh" }}
                        className="d-flex justify-content-center mt-4 mb-4">
                            <CardTitle className="p-4">
                            <Label>Map of govermemt offices</Label>
                            </CardTitle>
                            <CardBody className="m-3" style={{display:"flex",alignItems:"center"}}>
                            <Maps />
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </Container>
        </>
    )
}