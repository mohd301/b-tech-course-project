import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios"

export const addUserThunk = createAsyncThunk("sliceUser/addUserThunk", async (userData) => {
    try {
        const newUser = await axios.post("http://localhost:7500/addUser", userData)
        return (newUser.data)
    } catch (err) {
        console.log(err)
        return({ serverMsg: "Server Error"})
    }
})

export const userLoginThunk = createAsyncThunk("sliceUser/userLoginThunk", async (userData) => {
    try {
        const loginUser = await axios.post("http://localhost:7500/loginUser", userData)
        return (loginUser.data)
    } catch (err) {
        console.log(err)
        return({ serverMsg: "Server Error"})
    }
})

const initialState = {
    user: null,
    msg: null,
    loading: false
}

const sliceUser = createSlice(
    {
        name: "sliceUser",
        initialState: initialState,
        reducers: {},
        extraReducers: (builder) => {

            // Register new user
            builder.addCase(addUserThunk.pending, (state, action) => {
                state.loading = true
            })

            builder.addCase(addUserThunk.fulfilled, (state, action) => {
                state.msg = action.payload.serverMsg
                state.loading = false

            })

            builder.addCase(addUserThunk.rejected, (state, action) => {
                state.msg = action.error.message
                state.loading = false
            })

            // Login check
            builder.addCase(userLoginThunk.pending, (state, action) => {
                state.loading = true
            })

            builder.addCase(userLoginThunk.fulfilled, (state, action) => {
                state.msg = action.payload.serverMsg
                state.user = action.payload.user
                state.loading = false
            })

            builder.addCase(userLoginThunk.rejected, (state, action) => {
                state.msg = action.error.message
                state.loading = false
            })
        }
    }
)

export default sliceUser.reducer