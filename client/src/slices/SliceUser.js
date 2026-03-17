import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios"
import { act } from "react";

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
export const userApplyThunk = createAsyncThunk("sliceUser/Apply",async (userData,)=>{
    try{
        const El = await axios.get(`http://localhost:${process.env.REACT_APP_PORT}/Eligibility/${userData.ID}/${userData._id}`, userData)
        return (El.data)
    }catch(err){
        console.log(err)
        throw(err)
    }
})

const initialState = {
    user: null,
    msg: null,
    token: null,
    flag: false,
    loading: false,
    data:null,
}

const sliceUser = createSlice(
    {
        name: "sliceUser",
        initialState: initialState,
        reducers: {
            clearUserMsg: (state) => {
                state.msg = null
            }
        },
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
            builder.addCase(userApplyThunk.fulfilled,(state,action)=>{
                state.msg=action.payload.serverMsg
                state.flag=action.payload.flag
                state.data=action.payload.Data
                state.loading=false
            })
            builder.addCase(userApplyThunk.pending,(state,action)=>{
                state.msg=""
                state.flag=false
                
            state.loading=true
            })
            builder.addCase(userApplyThunk.rejected,(state,action)=>{
                state.msg = action.error.message
                state.loading = false
            })
        }

    }
)

export const { clearUserMsg } = sliceUser.actions
export default sliceUser.reducer