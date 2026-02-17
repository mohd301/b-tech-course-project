import { useTheme } from "../compsMisc/ThemeContext";
import {Table} from "reactstrap"

export default function UpdateUser(){
    const {theme} =useTheme
    return(
        <>
        <Table>
            <thead>
                <tr>
                    <th>Email</th>
                    <th>Phone</th>
                </tr>
            </thead>

        </Table>
        </>
    )
}