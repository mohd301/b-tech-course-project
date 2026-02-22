import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios"

export const privLoginThunk = createAsyncThunk("sliceAuth/privLoginThunk", async (privData) => {
    try {
        const loginPriv = await axios.post(`http://localhost:${process.env.REACT_APP_PORT}/loginPriv`, privData)
        return (loginPriv.data)
    } catch (err) {
        console.log(err)
        return ({ serverMsg: "Server Error" })
    }
})

export const userLoginThunk = createAsyncThunk("sliceAuth/userLoginThunk", async (userData) => {
    try {
        const loginUser = await axios.post(`http://localhost:${process.env.REACT_APP_PORT}/loginUser`, userData)
        return (loginUser.data)
    } catch (err) {
        console.log(err)
        throw (err)
    }
})

const initialState = {
    user: null,
    msg: null,
    token: null,
    flag: false,
    loading: false
}

const sliceAuth = createSlice(
    {
        name: "sliceAuth",
        initialState: initialState,
        reducers: {
            // Handle token deletion (logout)
            logout: (state) => {
                state.token = null;
                state.user = null;
                state.msg = null;
            },
            setToken: (state, action) => {
                state.token = action.payload
            },
            resetFlag: (state) => {
                state.flag = false;
            },
            clearMsg: (state) => {
                state.msg = null;
            },
        },
        extraReducers: (builder) => {

            // User Login check
            builder.addCase(userLoginThunk.pending, (state, action) => {
                state.loading = true
                state.flag = false
                state.msg = ""
            })

            builder.addCase(userLoginThunk.fulfilled, (state, action) => {
                state.msg = action.payload.serverMsg
                state.user = action.payload.user
                state.token = action.payload.token
                state.flag = action.payload.flag
                state.loading = false
            })

            builder.addCase(userLoginThunk.rejected, (state, action) => {
                state.msg = action.error.message
                state.loading = false
                state.flag = false
            })

            // Privileged User login check
            builder.addCase(privLoginThunk.pending, (state, action) => {
                state.loading = true
                state.flag = false
                state.msg = ""
            })

            builder.addCase(privLoginThunk.fulfilled, (state, action) => {
                state.msg = action.payload.serverMsg
                state.token = action.payload.token
                state.flag = action.payload.flag
                state.loading = false
            })

            builder.addCase(privLoginThunk.rejected, (state, action) => {
                state.msg = action.error.message
                state.loading = false
                state.flag = false
            })
        }
    }
)

export const { logout, setToken, resetFlag, clearMsg } = sliceAuth.actions
export default sliceAuth.reducer