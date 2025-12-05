import * as yup from 'yup';
const SchemaReg = yup.object().shape({
    Email: yup.string().required('Email Required').email('Should be valid'),
    Phone: yup.string().required("Phone number required").matches(/^(7(?:[1-2]|[6-9])|9[0-9])\d{6}$/, /* regex check for valid 8 digits Omani phone number */
        "Phone number must be a valid 8-digit Omani mobile number"),
    Password: yup.string().required('Password Required').min(8, 'Too Short').max(18, 'Too Long').matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).+$/, 'Must contain at least one special character, number and letter'), /* regex validating pwd using lookahead statements (?=.*) */
    confpwd: yup.string().required('Password Confirmation Required').oneOf([yup.ref('Password')], 'Password must Match')
})
export default SchemaReg;