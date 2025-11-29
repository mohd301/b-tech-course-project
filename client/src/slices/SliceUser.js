import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios"

export const addUserThunk = createAsyncThunk("sliceUser/addUserThunk", async (userData) => {
    try {
        const newUser = await axios.post(`http://localhost:${process.env.REACT_APP_PORT}/addUser`, userData)
        return (newUser.data)
    } catch (err) {
        console.log(err)
        return ({ serverMsg: "Server Error" })
    }
})

export const userLoginThunk = createAsyncThunk("sliceUser/userLoginThunk", async (userData) => {
    try {
        const loginUser = await axios.post(`http://localhost:${process.env.REACT_APP_PORT}/loginUser`, userData)
        return (loginUser.data)
    } catch (err) {
        console.log(err)
        return ({ serverMsg: "Server Error" })
    }
})

export const userChgPwdThunk = createAsyncThunk("sliceUser/userChgPwdThunk", async (userData) => {
    try {
        const User = await axios.put(`http://localhost:${process.env.REACT_APP_PORT}/chgPassword`, userData)
        return (User.data)
    } catch (err) {
        console.log(err)
        return ({ serverMsg: "Server Error" })
    }
})

const initialState = {
    user: null,
    msg: null,
    token: null,
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
            }
        },
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
            })

            builder.addCase(userChgPwdThunk.fulfilled, (state, action) => {
                state.msg = action.payload.serverMsg
                state.loading = false
            })

            builder.addCase(userChgPwdThunk.rejected, (state, action) => {
                state.msg = action.error.message
                state.loading = false
            })
        }
    }
)

export const { logoutUser, setUserToken } = sliceUser.actions
export default sliceUser.reducer