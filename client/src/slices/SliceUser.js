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

// Admin: Fetch all users
export const fetchUsersThunk = createAsyncThunk("sliceUser/fetchUsersThunk", async () => {
    try {
        const response = await axios.get(`http://localhost:${process.env.REACT_APP_PORT}/getUser`)
        return (response.data)
    } catch (err) {
        console.log(err)
        throw (err)
    }
})

// Admin: Delete user
export const deleteUserThunk = createAsyncThunk("sliceUser/deleteUserThunk", async (userData) => {
    try {
        const response = await axios.delete(`http://localhost:${process.env.REACT_APP_PORT}/delUser`, { data: userData })
        return (response.data)
    } catch (err) {
        console.log(err)
        throw (err)
    }
})

// Admin: Update user email or phone
export const updateUserThunk = createAsyncThunk("sliceUser/updateUserThunk", async (userData) => {
    try {
        const response = await axios.put(`http://localhost:${process.env.REACT_APP_PORT}/upduser`, userData)
        return (response.data)
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

            // Admin: Fetch all users
            builder.addCase(fetchUsersThunk.pending, (state, action) => {
                state.loading = true
            })

            builder.addCase(fetchUsersThunk.fulfilled, (state, action) => {
                state.userList = action.payload.data
                state.msg = action.payload.serverMsg
                state.loading = false
            })

            builder.addCase(fetchUsersThunk.rejected, (state, action) => {
                state.msg = action.error.message
                state.loading = false
            })

            // Admin: Delete user
            builder.addCase(deleteUserThunk.pending, (state, action) => {
                state.loading = true
            })

            builder.addCase(deleteUserThunk.fulfilled, (state, action) => {
                state.msg = action.payload.serverMsg
                state.flag = action.payload.flag
                state.loading = false
            })

            builder.addCase(deleteUserThunk.rejected, (state, action) => {
                state.msg = action.error.message
                state.loading = false
            })

            // Admin: Update user
            builder.addCase(updateUserThunk.pending, (state, action) => {
                state.loading = true
            })

            builder.addCase(updateUserThunk.fulfilled, (state, action) => {
                state.msg = action.payload.serverMsg
                state.flag = action.payload.flag
                state.loading = false
            })

            builder.addCase(updateUserThunk.rejected, (state, action) => {
                state.msg = action.error.message
                state.loading = false
            })
        }
    }
)

export const { logoutUser, setUserToken, resetFlag, clearMsg } = sliceUser.actions
export default sliceUser.reducer