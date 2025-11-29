import * as yup from 'yup';
const SchemaChgPwd = yup.object().shape({
    Email: yup.string().required('Email Required'),
    oldPassword: yup.string().required('Password Required'),
    newPassword: yup.string().required('New Password Required').min(6, 'Too Short').max(18, 'Too Long'),
    confpwd: yup.string().required('Password Confirmation Required').oneOf([yup.ref('newPassword')], 'Password must Match')
})
export default SchemaChgPwd;