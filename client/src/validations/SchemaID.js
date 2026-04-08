import * as yup from 'yup';
const SchemaID = yup.object().shape({
    ID: yup.string().required('ID Required').matches(/^\d{8}$/, 'ID must be exactly 8 digits')
})
export default SchemaID;