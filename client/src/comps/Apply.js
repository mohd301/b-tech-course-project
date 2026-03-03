import axios from "axios"
import { useState } from "react"
import { Button, Input } from "reactstrap"
export default function Apply(){
    function getdata(ID){
        axios.get("http://127.0.0.1:5000/EEml/"+ID).then(function(response){
            const data=response
            console.log(data)
        })

    }
    const [ID,SetId]=useState()
    return(
        <>
        <Input type="text" name="ID" value={SetId} placeholder="ID"></Input>
        <Button type="submit" onClick={getdata(ID)}>Sumbit</Button>
        {data.map((a)=>{
            <>
            {a.Eligibity}
            </>
        })}
        </>
    )
}