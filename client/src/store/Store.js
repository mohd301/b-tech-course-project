import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../slices/SliceUser";
import adminReducer from "../slices/SliceAdmin";

const Store = configureStore({
    reducer: { 
        user: userReducer, 
        admin: adminReducer 
    }
})
export default Store;