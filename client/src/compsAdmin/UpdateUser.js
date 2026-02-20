import { useTheme } from "../compsMisc/ThemeContext";
import {Table} from "reactstrap"
import { useSelector,useDispatch } from "react-redux";
export default function UpdateUser(){
    const {theme} =useTheme
    const user = useSelector((state)=>state.user )
    return(
        <>
        <Table>
            <thead>
                <tr>
                    <th>Email</th>
                    <th>Phone</th>
                </tr>
            </thead>
            <tbody>
                {user.map((i)=>{
                    return(
                        <>
                        <tr>
                            <td>{i.Email}</td>
                            <td>{i.phone}</td>
                        </tr>
                        </>
                    )
                })}

            </tbody>

        </Table>
        </>
    )
}