import * as yup from 'yup';
const SchemaChgPwd = yup.object().shape({
    Email: yup.string().required('Email Required'),
    oldPassword: yup.string().required('Password Required'),
    newPassword: yup.string().required('New Password Required').min(8, 'Too Short').max(18, 'Too Long').matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).+$/, 'Must contain at least one special character, number and letter'), /* regex validating pwd using lookahead statements (?=.*) */
    confpwd: yup.string().required('Password Confirmation Required').oneOf([yup.ref('newPassword')], 'Password must Match')
})
export default SchemaChgPwd;