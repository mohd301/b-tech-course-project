import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios"

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
export const deleteUserThunk = createAsyncThunk("sliceUser/deleteUserThunk", async (_id) => {
    try {
        const response = await axios.delete(`http://localhost:${process.env.REACT_APP_PORT}/delUser/${_id}`)
        return (response.data)
    } catch (err) {
        console.log(err)
        throw (err)
    }
})

// Admin: Update details
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
    msg: null,
    userList: [],
    loading: false,
}

const privSlice = createSlice(
    {
        name: "privSlice",
        initialState: initialState,
        reducers: {},
        extraReducers: (builder) => {
            // Admin: Fetch all users
            builder.addCase(fetchUsersThunk.pending, (state, action) => {
                state.loading = true
                state.msg = ""
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
                state.msg = ""
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
                state.msg = ""
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
//export const {  } = privSlice.actions
export default privSlice.reducer