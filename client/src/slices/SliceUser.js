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

export const userLoginThunk = createAsyncThunk("sliceUser/userLoginThunk", async (userData) => {
    try {
        const loginUser = await axios.post(`http://localhost:${process.env.REACT_APP_PORT}/loginUser`, userData)
        return (loginUser.data)
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

export const addMoreInfoThunk = createAsyncThunk("sliceUser/addMoreInfo", async (data) => {
    try {
        const result = await axios.post(`http://localhost:${process.env.REACT_APP_PORT}/addmoreinfo`, data, {
            headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
        })
        return (result.data)
    } catch (err) {
        console.log(err)
        throw (err)
    }
})

export const updateMoreInfoThunk = createAsyncThunk("sliceUser/updateMoreInfo", async (data) => {
    try {
        const result = await axios.put(`http://localhost:${process.env.REACT_APP_PORT}/updmoreinfo`, data, {
            headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
        })
        return (result.data)
    } catch (err) {
        console.log(err)
        throw (err)
    }
})

export const getMoreInfoThunk = createAsyncThunk("sliceUser/getMoreInfo", async () => {
    try {
        const result = await axios.get(`http://localhost:${process.env.REACT_APP_PORT}/findmoreinfo`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
        })
        return (result.data)
    } catch (err) {
        console.log(err)
        throw (err)
    }
})

export const deleteMoreInfoThunk = createAsyncThunk("sliceUser/deleteMoreInfo", async () => {
    try {
        const result = await axios.delete(`http://localhost:${process.env.REACT_APP_PORT}/delmoreinfo`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
        })
        return (result.data)
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
    loading: false,
    moreInfo: null,
    eligibilityResult: null
}

const sliceUser = createSlice(
    {
        name: "sliceUser",
        initialState: initialState,
        reducers: {
            // Handle token deletion (logout)
            logoutUser: (state) => {
                state.token = null;
                state.user = null;
                state.msg = null;
            },
            setUserToken: (state, action) => {
                state.token = action.payload
            },
            resetFlag: (state) => {
                state.flag = false;
            },
            clearMsg: (state) => {
                state.msg = null;
            },
            clearMoreInfo: (state) => {
                state.moreInfo = null;
            },
            setEligibilityResult: (state, action) => {
                state.eligibilityResult = action.payload;
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

            // Login check
            builder.addCase(userLoginThunk.pending, (state, action) => {
                state.loading = true
                state.flag = false
                state.msg = ""
            })

            builder.addCase(userLoginThunk.fulfilled, (state, action) => {
                state.msg = action.payload.serverMsg
                state.user = action.payload.user
                state.token = action.payload.token
                state.loading = false
            })

            builder.addCase(userLoginThunk.rejected, (state, action) => {
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

            // Add More Info
            builder.addCase(addMoreInfoThunk.pending, (state) => {
                state.loading = true
                state.msg = ""
            })
            builder.addCase(addMoreInfoThunk.fulfilled, (state, action) => {
                state.msg = action.payload.serverMsg
                state.moreInfo = action.payload.data
                state.loading = false
            })
            builder.addCase(addMoreInfoThunk.rejected, (state, action) => {
                state.msg = action.error.message
                state.loading = false
            })

            // Update More Info
            builder.addCase(updateMoreInfoThunk.pending, (state) => {
                state.loading = true
                state.msg = ""
            })
            builder.addCase(updateMoreInfoThunk.fulfilled, (state, action) => {
                state.msg = action.payload.serverMsg
                state.moreInfo = action.payload.data
                state.loading = false
            })
            builder.addCase(updateMoreInfoThunk.rejected, (state, action) => {
                state.msg = action.error.message
                state.loading = false
            })

            // Get More Info
            builder.addCase(getMoreInfoThunk.pending, (state) => {
                state.loading = true
            })
            builder.addCase(getMoreInfoThunk.fulfilled, (state, action) => {
                state.moreInfo = action.payload.data
                state.loading = false
            })
            builder.addCase(getMoreInfoThunk.rejected, (state) => {
                state.loading = false
            })

            // Delete More Info
            builder.addCase(deleteMoreInfoThunk.pending, (state) => {
                state.loading = true
                state.msg = ""
            })
            builder.addCase(deleteMoreInfoThunk.fulfilled, (state, action) => {
                state.msg = action.payload.serverMsg
                state.moreInfo = null
                state.loading = false
            })
            builder.addCase(deleteMoreInfoThunk.rejected, (state, action) => {
                state.msg = action.error.message
                state.loading = false
            })
        }
    }
)

export const { logoutUser, setUserToken, resetFlag, clearMsg, clearMoreInfo, setEligibilityResult } = sliceUser.actions
export default sliceUser.reducer