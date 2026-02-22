import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios"

const initialState = {
    msg: null,
    token: null,
    loading: false,
}

const privSlice = createSlice(
    {
        name: "privSlice",
        initialState: initialState,
        reducers: {},
        extraReducers: (builder) => {
        }
    }
)
//export const {  } = privSlice.actions
export default privSlice.reducer