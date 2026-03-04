import { useState } from "react";
import CenteredSpinner from "./CenteredSpinner";

export default function Maps({ borderRadius = "0" }) {
    const [loading, setLoading] = useState(true);
    const src = "https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d55701.131935306934!2d58.358200196975865!3d23.549405932515644!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1srop!5e1!3m2!1sen!2som!4v1771936212570!5m2!1sen!2som"
    return (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
            {loading &&
                <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1 }}>
                    <CenteredSpinner />
                </div>}
            <iframe src={src} title="Map" width="100%" height="100%" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade" style={{ borderRadius }} onLoad={() => setLoading(false)}></iframe>
        </div>
    )
}