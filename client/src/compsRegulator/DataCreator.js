import {Card, CardBody, CardHeader, Container, Input} from "reactstrap"
import { useSelector, useDispatch } from "react-redux"
import { useState } from "react"

export default function DataCreator(){
    const [value,setValue]=useState({
            n_eligible=300,
            n_ineligible=500,
            fruad_fraction=0.1,
            Age=0,
            Gender=0,
            Marital_Status=0,
            Household_Size=0,
            Governorate=0,
            Salary=0,
            Degree_Level=0,
            Employment_Status=0,
            Primary_Income_Source=0,
            Has_Other_Social_Benefits=0,
            Assets_Value=0,
            Liabilities_Value=0,
            Number_of_Children=0,
            Total_Spouse_Income=0,
            Working_Children_Count=0,
            Total_Children_Income=0,
            Total_Household_Income=0,
            Vehicle_Ownership=0,
            Vehicle_Count=0,
            Cylinder_Count=0,
            Vehicle_Age_Years=0,
            Fuel_Type=0,
            Expected_Fuel_Consumption_L=0,
            Average_Fuel_Consumption_L=0,
            Fuel_Deviation_L=0,
            Fuel_Deviation_Ratio=0,
            Previous_Subsidy_Received=0,
            Previous_Subsidy_Amount=0,
            Late_or_Missed_Renewals=0,
            Applications_Last_12_Months=0,
            Conditions=0
    })

    return(
       <>
       <div>
        <Container fluid>
            <Row>
                <Col xs='4'>
            <Card>
                <CardHeader> Pick how many eligible and not eligible entires in the data </CardHeader>
                <CardBody>
                    <label>number of eligible</label>
                    <Input type="number" value={value.n_eligible}></Input>
                    <label>number of not eligible</label>
                    <Input type="number" value={value.n_ineligible}></Input>
                </CardBody>
            </Card>
            </Col>
            <Col xs='4'>
            <Card>
                <CardHeader> Enter your fruad entires</CardHeader>
                <CardBody>
                    <label></label>
                </CardBody>
            </Card>
            </Col>
            </Row>
        </Container>
       </div>
       </> 
    )

} 