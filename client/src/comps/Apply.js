import axios from "axios"
import { useState ,useEffect} from "react"
import { Button, Input, Card, Form, Label, CardBody } from "reactstrap"
import { useTheme } from "../compsMisc/ThemeContext"
import { useSelector } from "react-redux"
export default function Apply() {
    const user = localStorage.getItem("authToken")
    console.log(user)
    const { theme } = useTheme()
    const [Data, Setdata]=useState()
    async function getdata(ID) {
        try{
        const res= await axios.get("http://127.0.0.1:5000/EEml/" + ID +"/"+ user._id)

        console.log(res.data)
        Setdata(res.data)
        
        }catch(e){
            console.log(e)
        }
    }
    const handleid=(e)=>{
        SetId(e.target.value)
    }
    
    const [ID, SetId] = useState()
    
    const onsubmit = () => {
        getdata(ID)
    }
    return (
        <>
            <div style={{ background: theme.primaryBackground, minHeight: "82.1vh" }}>
                <Form>
                    <div className="d-flex justify-content-center align-items-center">
                        <Card style={{ background: theme.tertiaryColor, minHeight: "68vh", width: "50vw", borderRadius: "6vh" }}
                        className="d-flex justify-content-center mt-4 mb-4">
                            <CardBody className="p-4">
                                <div className="mb-5">
                                    <h1 className="text-center" style={{ color: "white" }}>Apply for Eligibity</h1>
                                </div>
                            <Label style={{color:"white"}}>Enter your ID</Label>
                            <Input type="text" name="ID" style={{width:"45%"}} value={ID} onChange={handleid} placeholder="ID"></Input>
                            <div className="d-flex align-items-end justify-content-end mt-5">
                            <Button style={{background:theme.primaryColor}} onClick={onsubmit}>Sumbit</Button>
                            </div>
                            {Data?.Eligibity===1?(
                                <Label style={{color:"white"}}>Eligible</Label>
                            ):(
                                <Label style={{color:"white"}}>Not Eligible</Label>
                            )
                            }

                            </CardBody>
                        </Card>
                    </div>
                </Form>
            </div>
        </>
    )
}