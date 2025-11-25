import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../slices/SliceUser";
import privReducer from "../slices/SlicePriv";

const Store = configureStore({
    reducer: { 
        user: userReducer, 
        priv: privReducer,
    }
})
export default Store;