import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

// Standardized password input component (all in one place)
export default function PasswordInput({
    register,
    name,
    rules,
    value,
    onChange,
    placeholder = "*******",
    className = "form-control",
    width = "45%",
    iconColor = "gray"
}) {
    const [show, setShow] = useState(false);

    // Only attach register when both register and name exist
    const registerProps = register && name ? register(name, rules) : {};

    return (
        <div style={{ position: "relative", width }}>
            <input className={className} type={show ? "text" : "password"} placeholder={placeholder}
                // react-hook-form mode (uncontrolled)
                {...registerProps}

                // Controlled mode (only when register is NOT used)
                {...(!register ? { value, onChange } : {})}

                style={{ width: "100%" }}/>

            <span onClick={() => setShow(!show)}
                style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    color: iconColor
                }}>
                {show ? <FaEyeSlash /> : <FaEye />}
            </span>
        </div>
    );
}