import Maps from "../compsMisc/Map"
import { Card, CardBody, CardTitle, Container } from "reactstrap"
import { useTheme } from "../compsMisc/ThemeContext"

export default function GovOf() {
    const { theme } = useTheme()
    return (
        <Container fluid className="py-4" style={{ minHeight: "80vh" }}>
            <Container>
                <h2 style={{ color: theme.textColorAlt }} >Map of Government Offices</h2>
            </Container>
            <Container className="d-flex justify-content-center align-items-center mt-4" style={{ height: "100%" }}>
                <Card style={{ background: theme.secondaryColor, borderColor: theme.secondaryColor, height: "50vh", width: "50vw", borderRadius: "4vh" }}
                    className="d-flex justify-content-center align-items-center border-3">

                    <Maps borderRadius="4vh" />

                </Card>
            </Container>
        </Container>

    )
}