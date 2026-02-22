import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slices/SliceAuth";
import userReducer from "../slices/SliceUser";
import privReducer from "../slices/SlicePriv";

const Store = configureStore({
    reducer: { 
        auth: authReducer,
        user: userReducer, 
        priv: privReducer,
    }
})
export default Store;