import * as yup from 'yup';
const SchemaReg = yup.object().shape({
    Email: yup.string().required('Email Required').email('Should be valid'),
})
export default SchemaReg;