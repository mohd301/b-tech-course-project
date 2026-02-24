import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios"

export const addUserThunk = createAsyncThunk("sliceUser/addUserThunk", async (userData) => {
    try {
        const newUser = await axios.post(`http://localhost:${process.env.REACT_APP_PORT}/addUser`, userData)
        return (newUser.data)
    } catch (err) {
        console.log(err)
        throw (err)
    }
})

export const sendOtpThunk = createAsyncThunk("sliceUser/sendOtpThunk", async (userData) => {
    try {
        const sendOtp = await axios.post(`http://localhost:${process.env.REACT_APP_PORT}/sendOtp`, userData)
        return (sendOtp.data)
    } catch (err) {
        console.log(err)
        throw (err)
    }
})

export const verifyOtpThunk = createAsyncThunk("sliceUser/verifyOtpThunk", async (userData) => {
    try {
        const verifyOtp = await axios.post(`http://localhost:${process.env.REACT_APP_PORT}/verifyOtp`, userData)
        return (verifyOtp.data)
    } catch (err) {
        console.log(err)
        throw (err)
    }
})

export const userChgPwdThunk = createAsyncThunk("sliceUser/userChgPwdThunk", async (userData) => {
    try {
        const User = await axios.put(`http://localhost:${process.env.REACT_APP_PORT}/chgPassword`, userData)
        return (User.data)
    } catch (err) {
        console.log(err)
        throw (err)
    }
})

export const userForgotPwdThunk = createAsyncThunk("sliceUser/userForgotPwdThunk", async (userData) => {
    try {
        const User = await axios.put(`http://localhost:${process.env.REACT_APP_PORT}/forgotPassword`, userData)
        return (User.data)
    } catch (err) {
        console.log(err)
        throw (err)
    }
})
export const userUpdusrThunk = createAsyncThunk("sliceUser/upduser", async (userData) => {
    try {
        const User = await axios.put(`http://localhost:${process.env.REACT_APP_PORT}/upduser`, userData)
        return (User.data)
    } catch (err) {
        console.log(err)
        throw (err)
    }
})

const initialState = {
    user: null,
    userList: [],
    msg: null,
    token: null,
    flag: false,
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
                state.flag = false
                state.msg = ""
            })

            builder.addCase(addUserThunk.fulfilled, (state, action) => {
                state.msg = action.payload.serverMsg
                state.flag = action.payload.flag
                state.loading = false

            })

            builder.addCase(addUserThunk.rejected, (state, action) => {
                state.msg = action.error.message
                state.loading = false
            })

            // Send OTP
            builder.addCase(sendOtpThunk.pending, (state, action) => {
                state.loading = true
                state.flag = false
                state.msg = ""
            })

            builder.addCase(sendOtpThunk.fulfilled, (state, action) => {
                state.msg = action.payload.serverMsg
                state.loading = false

            })

            builder.addCase(sendOtpThunk.rejected, (state, action) => {
                state.msg = action.error.message
                state.loading = false
            })

            // Verify OTP
            builder.addCase(verifyOtpThunk.pending, (state, action) => {
                state.loading = true
                state.flag = false
                state.msg = ""
            })

            builder.addCase(verifyOtpThunk.fulfilled, (state, action) => {
                state.msg = action.payload.serverMsg
                state.loading = false

            })

            builder.addCase(verifyOtpThunk.rejected, (state, action) => {
                state.msg = action.error.message
                state.loading = false
            })

            // Change Password
            builder.addCase(userChgPwdThunk.pending, (state, action) => {
                state.loading = true
                state.flag = false
                state.msg = ""
            })

            builder.addCase(userChgPwdThunk.fulfilled, (state, action) => {
                state.msg = action.payload.serverMsg
                state.flag = action.payload.flag
                state.loading = false
            })

            builder.addCase(userChgPwdThunk.rejected, (state, action) => {
                state.msg = action.error.message
                state.loading = false
            })

            // Forgot Password
            builder.addCase(userForgotPwdThunk.pending, (state, action) => {
                state.loading = true
                state.flag = false
                state.msg = ""
            })

            builder.addCase(userForgotPwdThunk.fulfilled, (state, action) => {
                state.msg = action.payload.serverMsg
                state.flag = action.payload.flag
                state.loading = false
            })

            builder.addCase(userForgotPwdThunk.rejected, (state, action) => {
                state.msg = action.error.message
                state.loading = false
            })
            builder.addCase(userUpdusrThunk.fulfilled, (state, action) => {
                state.msg = action.payload.serverMsg
                state.flag = action.payload.flag
                state.loading = false
            })
        }
    }
)

//export const { } = sliceUser.actions
export default sliceUser.reducer