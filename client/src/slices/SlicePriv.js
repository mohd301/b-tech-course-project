import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios"

// Admin: Fetch all users
export const fetchUsersThunk = createAsyncThunk("privSlice/fetchUsersThunk", async () => {
    try {
        const response = await axios.get(`http://localhost:${process.env.REACT_APP_PORT}/getUser`)
        return (response.data)
    } catch (err) {
        console.log(err)
        throw (err)
    }
})

// Admin: Delete user
export const deleteUserThunk = createAsyncThunk("privSlice/deleteUserThunk", async (_id) => {
    try {
        const response = await axios.delete(`http://localhost:${process.env.REACT_APP_PORT}/delUser/${_id}`,
            { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } })
        return (response.data)
    } catch (err) {
        console.log(err)
        throw (err)
    }
})

// Admin: Update details
export const updateUserThunk = createAsyncThunk("privSlice/updateUserThunk", async (userData) => {
    try {
        const response = await axios.put(`http://localhost:${process.env.REACT_APP_PORT}/upduser/${userData._id}`, userData,
            { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } }) // Include token in Authorization header for logging purposes
        return (response.data)
    } catch (err) {
        console.log(err)
        throw (err)
    }
})

// Admin: Get audit logs
export const fetchAuditLogsThunk = createAsyncThunk("privSlice/fetchAuditLogsThunk", async () => {
    try {
        const response = await axios.get(`http://localhost:${process.env.REACT_APP_PORT}/getAuditLogs`)
        return (response.data)
    } catch (err) {
        console.log(err)
        throw (err)
    }
})

// ==================== DATASET THUNKS ====================

// Upload dataset (Regulator)
export const uploadDatasetThunk = createAsyncThunk("privSlice/uploadDatasetThunk", async (formData) => {
    try {
        const response = await axios.post(
            `http://localhost:${process.env.REACT_APP_PORT}/uploadDataset`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                    "Content-Type": "multipart/form-data"
                }
            }
        )
        return response.data
    } catch (err) {
        console.log(err)
        throw err.response?.data?.serverMsg || "Failed to upload dataset"
    }
})

// Fetch all datasets
export const fetchDatasetsThunk = createAsyncThunk("privSlice/fetchDatasetsThunk", async (filters = {}) => {
    try {
        const params = {}
        if (filters.datePreset && filters.datePreset !== "all") {
            params.datePreset = filters.datePreset
        }

        const response = await axios.get(
            `http://localhost:${process.env.REACT_APP_PORT}/getDatasets`,
            { params }
        )
        return response.data
    } catch (err) {
        console.log(err)
        throw err
    }
})

// Fetch single dataset (with content)
export const fetchDatasetThunk = createAsyncThunk("privSlice/fetchDatasetThunk", async (id) => {
    try {
        const response = await axios.get(
            `http://localhost:${process.env.REACT_APP_PORT}/getDataset/${id}`,
            { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } }
        )
        return response.data
    } catch (err) {
        console.log(err)
        throw err
    }
})

// Delete dataset
export const deleteDatasetThunk = createAsyncThunk("privSlice/deleteDatasetThunk", async (id) => {
    try {
        const response = await axios.delete(
            `http://localhost:${process.env.REACT_APP_PORT}/deleteDataset/${id}`,
            { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } }
        )
        return response.data
    } catch (err) {
        console.log(err)
        throw err
    }
})

// Update dataset
export const updateDatasetThunk = createAsyncThunk("privSlice/updateDatasetThunk", async (data) => {
    try {
        const response = await axios.put(
            `http://localhost:${process.env.REACT_APP_PORT}/updateDataset/${data._id}`,
            { description: data.description },
            { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } }
        )
        return response.data
    } catch (err) {
        console.log(err)
        throw err
    }
})

// Fetch dataset statistics
export const fetchDatasetStatsThunk = createAsyncThunk("privSlice/fetchDatasetStatsThunk", async (filters = {}) => {
    try {
        const params = {}
        if (filters.datePreset && filters.datePreset !== "all") {
            params.datePreset = filters.datePreset
        }

        const response = await axios.get(
            `http://localhost:${process.env.REACT_APP_PORT}/getDatasetStats`,
            {
                params,
                headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
            }
        )
        return response.data
    } catch (err) {
        console.log(err)
        throw err
    }
})

// Fetch Eligibility info
export const fetchELInfoThunk = createAsyncThunk("privSlice/fetchELInfoThunk", async (filters = {}) => {
    try {
        const params = {}
        if (filters.datePreset && filters.datePreset !== "all") {
            params.datePreset = filters.datePreset
        }
        if (filters.region && filters.region !== "all") {
            params.region = filters.region
        }
        if (filters.status && filters.status !== "all") {
            params.status = filters.status
        }

        const response = await axios.get(
            `http://localhost:${process.env.REACT_APP_PORT}/viewELlink`,
            {
                params,
                headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
            }
        )
        return response.data
    } catch (err) {
        console.log(err)
        throw err
    }
})

export const createDataThunk=createAsyncThunk('privSlice/createDataThunk',async(data)=>{
    try{
        const response = await axios.post(
            `http://localhost:${process.env.REACT_APP_PORT}/createData`,
            {dname:data},
            { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } }
        )
        return response.data
    } catch (err) {
        console.log(err)
        throw err
    }
})
export const fetchELAnalytics = createAsyncThunk("privSlice/fetchELAnalytics", async (filters = {}) => {
    try {
        const params = {}
        if (filters.datePreset && filters.datePreset !== "all") {
            params.datePreset = filters.datePreset
        }
        if (filters.region && filters.region !== "all") {
            params.region = filters.region
        }
        if (filters.status && filters.status !== "all") {
            params.status = filters.status
        }

        const response = await axios.get(
            `http://localhost:${process.env.REACT_APP_PORT}/eligibility_analytics`,
            {
                params,
                headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
            }
        )
        
        return response.data
    } catch (err) {
        console.log(err)
        throw err
    }
})
export const activateDatasetThunk = createAsyncThunk("privSlice/activateDatasetThunk", async (id, { rejectWithValue }) => {
    try {
        const response = await axios.put(
            `http://localhost:${process.env.REACT_APP_PORT}/changedata/${id}`,
            {},
            { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } }
        )

        if (!response.data.flag) {
            return rejectWithValue(response.data.serverMsg || "Failed to activate dataset")
        }

        return response.data
    } catch (err) {
        console.log(err)
        return rejectWithValue(err.response?.data?.serverMsg || "Failed to activate dataset")
    }
})
export const fetchELAnalyticsMonthly = createAsyncThunk("privSlice/fetchELAnalyticsMonthly", async (filters = {}) => {
    try {
        const params = {}
        if (filters.datePreset && filters.datePreset !== "all") {
            params.datePreset = filters.datePreset
        }
        if (filters.region && filters.region !== "all") {
            params.region = filters.region
        }
        if (filters.status && filters.status !== "all") {
            params.status = filters.status
        }

        const response = await axios.get(
            `http://localhost:${process.env.REACT_APP_PORT}/eligibility_analytics/monthly`,
            {
                params,
                headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
            }
        )
        return response.data
    } catch (err) {
        console.log(err)
        throw err
    }
})

// Regulator: Get all applied applicant info
export const fetchAggregatedUserInfo = createAsyncThunk("privSlice/fetchAggregatedUserInfo", async () => {
    try {
        const response = await axios.get(`http://localhost:${process.env.REACT_APP_PORT}/getAggregatedUserInfo`)
        return (response.data)
    } catch (err) {
        console.log(err)
        throw err
    }
})

// Regulator: Delete user eligibility
export const deleteUserEligibilityThunk = createAsyncThunk("privSlice/deleteUserEligibilityThunk", async (userEligibilityInfo) => {
    try {
        const response = await axios.delete(`http://localhost:${process.env.REACT_APP_PORT}/deleteEligibility/${userEligibilityInfo._id}/${userEligibilityInfo.Email}`,
            { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } })
        return (response.data)
    } catch (err) {
        console.log(err)
        throw (err)
    }
})

// Admin: Fetch new Conditions
export const fetchRulesThunk = createAsyncThunk("privSlice/fetchRulesThunk", async () => {
    try {
        const response = await axios.get(`http://localhost:${process.env.REACT_APP_PORT}/getConditions`)
        return (response.data)
    } catch (err) {
        console.log(err)
        throw (err)
    }
})

const initialState = {
    msg: null,
    userList: [],
    auditLogs: [],
    datasetList: [],
    datasetStats: null,
    elInfo: [],
    loading: false,
    flag: false,
    analytic:{},
    manalytis:[],
    userEligibility: [],
    rules: []
    
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
                state.flag = action.payload.flag
                state.loading = false
            })

            builder.addCase(fetchUsersThunk.rejected, (state, action) => {
                state.msg = action.error.message
                state.flag = false
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
                state.flag = false
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
                state.flag = false
                state.loading = false
            })

            // Admin: Fetch audit logs
            builder.addCase(fetchAuditLogsThunk.pending, (state, action) => {
                state.loading = true
                state.msg = ""
            })

            builder.addCase(fetchAuditLogsThunk.fulfilled, (state, action) => {
                state.auditLogs = action.payload.data
                state.msg = action.payload.serverMsg
                state.flag = action.payload.flag
                state.loading = false
            })

            builder.addCase(fetchAuditLogsThunk.rejected, (state, action) => {
                state.msg = action.error.message
                state.flag = false
                state.loading = false
            })

            // ==================== DATASET REDUCERS ====================

            // Upload dataset
            builder.addCase(uploadDatasetThunk.pending, (state) => {
                state.loading = true
                state.msg = ""
            })

            builder.addCase(uploadDatasetThunk.fulfilled, (state, action) => {
                state.msg = action.payload.serverMsg
                state.flag = action.payload.flag
                state.loading = false
            })

            builder.addCase(uploadDatasetThunk.rejected, (state, action) => {
                state.msg = action.error.message
                state.flag = false
                state.loading = false
            })

            // Fetch datasets
            builder.addCase(fetchDatasetsThunk.pending, (state) => {
                state.loading = true
                state.msg = ""
            })

            builder.addCase(fetchDatasetsThunk.fulfilled, (state, action) => {
                state.datasetList = action.payload.data
                state.msg = action.payload.serverMsg
                state.flag = action.payload.flag
                state.loading = false
            })

            builder.addCase(fetchDatasetsThunk.rejected, (state, action) => {
                state.msg = action.error.message
                state.flag = false
                state.loading = false
            })

            // Delete dataset
            builder.addCase(deleteDatasetThunk.pending, (state) => {
                state.loading = true
                state.msg = ""
            })

            builder.addCase(deleteDatasetThunk.fulfilled, (state, action) => {
                state.msg = action.payload.serverMsg
                state.flag = action.payload.flag
                state.loading = false
            })

            builder.addCase(deleteDatasetThunk.rejected, (state, action) => {
                state.msg = action.error.message
                state.flag = false
                state.loading = false
            })

            // Update dataset
            builder.addCase(updateDatasetThunk.pending, (state) => {
                state.loading = true
                state.msg = ""
            })

            builder.addCase(updateDatasetThunk.fulfilled, (state, action) => {
                state.msg = action.payload.serverMsg
                state.flag = action.payload.flag
                state.loading = false
            })

            builder.addCase(updateDatasetThunk.rejected, (state, action) => {
                state.msg = action.error.message
                state.flag = false
                state.loading = false
            })

            // Fetch dataset stats
            builder.addCase(fetchDatasetStatsThunk.pending, (state) => {
                state.loading = true
                state.msg = ""
            })

            builder.addCase(fetchDatasetStatsThunk.fulfilled, (state, action) => {
                state.datasetStats = action.payload.data
                state.msg = action.payload.serverMsg
                state.flag = action.payload.flag
                state.loading = false
            })

            builder.addCase(fetchDatasetStatsThunk.rejected, (state, action) => {
                state.msg = action.error.message
                state.flag = false
                state.loading = false
            })

            // Fetch eligibility info
            builder.addCase(fetchELInfoThunk.pending, (state) => {
                state.loading = true
                state.msg = ""
            })

            builder.addCase(fetchELInfoThunk.fulfilled, (state, action) => {
                state.elInfo = action.payload.data
                state.msg = action.payload.serverMsg
                state.flag = action.payload.flag
                state.loading = false
            })

            builder.addCase(fetchELInfoThunk.rejected, (state, action) => {
                state.msg = action.error.message
                state.flag = false
                state.loading = false
            })
            builder.addCase(fetchELAnalytics.pending, (state) => {
                state.loading = true
                state.msg = ""
            })

            builder.addCase(fetchELAnalytics.fulfilled, (state, action) => {
                state.analytic = action.payload.data 
                state.msg = action.payload.serverMsg
                state.flag = action.payload.flag
                state.loading = false
            })

            builder.addCase(fetchELAnalytics.rejected, (state, action) => {
                state.msg = action.error.message
                state.flag = false
                state.loading = false
            })
            builder.addCase(activateDatasetThunk.pending, (state) => {
                state.loading = true
                state.msg = ""
            })

            builder.addCase(activateDatasetThunk.fulfilled, (state, action) => {
                const activeDataset = action.payload.data
                state.datasetList = state.datasetList.map((dataset) => ({
                    ...dataset,
                    Active: dataset._id === activeDataset?._id
                }))
                state.msg = action.payload.serverMsg
                state.flag = action.payload.flag
                state.loading = false
            })

            builder.addCase(activateDatasetThunk.rejected, (state, action) => {
                state.msg = action.payload || action.error.message
                state.flag = false
                state.loading = false
            })
            builder.addCase(fetchELAnalyticsMonthly.pending, (state) => {
                state.loading = true
                state.msg = ""
            })

            builder.addCase(fetchELAnalyticsMonthly.fulfilled, (state, action) => {
                state.manalytis = action.payload.data 
                state.msg = action.payload.serverMsg
                state.flag = action.payload.flag
                state.loading = false
            })

            builder.addCase(fetchELAnalyticsMonthly.rejected, (state, action) => {
                state.msg = action.error.message
                state.flag = false
                state.loading = false
            })
            
            // Regulator: Get all applied applicant info
            builder.addCase(fetchAggregatedUserInfo.pending, (state, action) => {
                state.loading = true
                state.msg = ""
            })

            builder.addCase(fetchAggregatedUserInfo.fulfilled, (state, action) => {
                state.userEligibility = action.payload.data
                state.msg = action.payload.serverMsg
                state.flag = action.payload.flag
                state.loading = false
            })

            builder.addCase(fetchAggregatedUserInfo.rejected, (state, action) => {
                state.msg = action.error.message
                state.flag = false
                state.loading = false
            })

            // Regulator: Delete user Eligibility
            builder.addCase(deleteUserEligibilityThunk.pending, (state, action) => {
                state.loading = true
                state.msg = ""
            })

            builder.addCase(deleteUserEligibilityThunk.fulfilled, (state, action) => {
                state.msg = action.payload.serverMsg
                state.flag = action.payload.flag
                state.loading = false
            })

            builder.addCase(deleteUserEligibilityThunk.rejected, (state, action) => {
                state.msg = action.error.message
                state.flag = false
                state.loading = false
            })

            // Regulator: Delete user Eligibility
            builder.addCase(fetchRulesThunk.pending, (state, action) => {
                state.loading = true
                state.msg = ""
            })

            builder.addCase(fetchRulesThunk.fulfilled, (state, action) => {
                state.rules = action.payload.data
                state.msg = action.payload.serverMsg
                state.flag = action.payload.flag
                state.loading = false
            })

            builder.addCase(fetchRulesThunk.rejected, (state, action) => {
                state.msg = action.error.message
                state.flag = false
                state.loading = false
            })
        }
    }
)
//export const {  } = privSlice.actions
export default privSlice.reducer
