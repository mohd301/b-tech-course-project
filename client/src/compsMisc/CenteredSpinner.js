import { Container, Spinner } from "reactstrap";

export default function CenteredSpinner({ height, color = "white", size = "lg" }) {
    return (
        <Container className="d-flex align-items-center justify-content-center" style={{height, color}}>
            <Spinner size={size} />
        </Container>
    )
}