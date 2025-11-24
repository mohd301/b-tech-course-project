import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios"

export const privLoginThunk = createAsyncThunk("privSlice/privLoginThunk", async (privData) => {
    try {
        const loginPriv = await axios.post(`http://localhost:${process.env.REACT_APP_PORT}/loginPriv`, privData)
        return (loginPriv.data)
    } catch (err) {
        console.log(err)
        return ({ serverMsg: "Server Error" })
    }
})


const initialState = {
    msg: null,
    token: null,
    loading: false,
}

const privSlice = createSlice(
    {
        name: "privSlice",
        initialState: initialState,
        reducers: {
            // Handle token deletion (logout)
            logoutPriv: (state) => {
                state.token = null;
                state.msg = null;
            },
            setPrivToken: (state, action) => {
                state.token = action.payload
            }
        },
        extraReducers: (builder) => {

            // Privileged User login check
            builder.addCase(privLoginThunk.pending, (state, action) => {
                state.loading = true
            })

            builder.addCase(privLoginThunk.fulfilled, (state, action) => {
                state.msg = action.payload.serverMsg
                state.token = action.payload.token
                state.loading = false
            })

            builder.addCase(privLoginThunk.rejected, (state, action) => {
                state.msg = action.error.message
                state.loading = false
            })
        }
    }
)
export const { logoutPriv, setPrivToken } = privSlice.actions
export default privSlice.reducer