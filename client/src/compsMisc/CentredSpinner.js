import { Container, Spinner } from "reactstrap";

export default function CenteredSpinner({ height, color = "light"}) {
    return (
        <Container className="d-flex align-items-center justify-content-center" style={{height}}>
            <Spinner color={color} />
        </Container>
    )
}