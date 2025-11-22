import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios"

export const adminLoginThunk = createAsyncThunk("adminSlice/adminLoginThunk", async (adminData) => {
    try {
        const loginAdmin = await axios.post("http://localhost:7500/loginAdmin", adminData)
        return (loginAdmin.data)
    } catch (err) {
        console.log(err)
        return ({ serverMsg: "Server Error" })
    }
})


const initialState = {
    msg: null,
    loading: false,
}

const adminSlice = createSlice(
    {
        name: "adminSlice",
        initialState: initialState,
        reducers: {},
        extraReducers: (builder) => {

            // Admin login check
            builder.addCase(adminLoginThunk.pending, (state, action) => {
                state.loading = true
            })

            builder.addCase(adminLoginThunk.fulfilled, (state, action) => {
                state.msg = action.payload.serverMsg
                state.loading = false
            })

            builder.addCase(adminLoginThunk.rejected, (state, action) => {
                state.msg = action.error.message
                state.loading = false
            })
        }
    }
)

export default adminSlice.reducer