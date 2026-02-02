import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// Async Thunk for User Registration
// Handles the API call to register a new user
export const userRegister = createAsyncThunk(
  "user/register",
  async (formData, { rejectWithValue }) => {
    try {
      //sending FormData  beacuase your backend expects multipart/form-data(files)

      const response = await axios.post("/api/v1/users/register", formData);

      //Return the entire Api response object coming from the backend
      return response.data;
    } catch (error) {
      // Handle errors from ApiError class in backend
      //   return rejectWithValue(error.response?.data || "something went Wrong");
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      // rejectWithValue allows us to return a custom error payload to the rejected action
      return rejectWithValue(errorMessage);
    }
  },
);

// Async Thunk for User Login
export const logInUser = createAsyncThunk(
  "user/login",
  async (loginData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/v1/users/login", loginData);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      return rejectWithValue(errorMessage);
    }
  },
);

// Async Thunk for User Logout
export const logOutUser = createAsyncThunk(
  "user/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/v1/users/logout");
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      return rejectWithValue(errorMessage);
    }
  },
);

const initialState = {
  isLoading: false,
  isError: false,
  isSuccess: false,
  userInfo: null, // Stores the user object when logged in
  message: "",
  authStatus: false, // Tracks if the user is currently authenticated
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Synchronous reducers for manual state updates
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    },
    // Used to manually set login state (e.g., from App.jsx session check)
    login:(state,action)=>{
      state.authStatus=true;
      state.userInfo=action.payload
    }
    ,
    // Used to manually clear state
    logout:(state)=>{
      state.authStatus=false;
      state.userInfo = null;
    }
  },
  // Handle lifecycle actions of async thunks (pending, fulfilled, rejected)
  extraReducers: (builder) => {
    builder
      // Registration Lifecycle
      .addCase(userRegister.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(userRegister.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.userInfo = action.payload.data;
        state.message = action.payload.message;
      })
      .addCase(userRegister.rejected, (state, action) => {
        state.isError = true;
        state.isLoading = false;
        state.isSuccess = false;
        state.message = action.payload || "Registration failed";
        state.userInfo = null;
      })
      // Login Lifecycle
      .addCase(logInUser.pending,(state)=>{
        state.isLoading= true;
      })
      .addCase(logInUser.fulfilled , (state,action)=>{
        state.isLoading= false;
        state.isSuccess= true;
        state.isError = false;
        state.authStatus= true;
        state.userInfo=action.payload.data.user;
        state.message=action.payload ||  "User LoggedIn Successfully"
      })
      .addCase(logInUser.rejected,(state,action)=>{
        state.isLoading= false;
        state.isError  = true;
        state.isSuccess= false;
        state.authStatus= false;
        state.userInfo= null;
        state.message=action.payload || "User LogIn Failed "
      })
      // Logout Lifecycle
      .addCase(logOutUser.pending,(state)=>{
        state.isLoading= true;
      })
      .addCase(logOutUser.fulfilled,(state)=>{
        state.isLoading= false;
        state.isSuccess= true;
        state.isError = false;
        state.authStatus= false;
        state.userInfo= null;
        state.message="User logged out successfully"
      })
      .addCase(logOutUser.rejected,(state,action)=>{
        state.isLoading= false;
        state.isError  = true;
        state.isSuccess= false;
        state.message=action.payload?.message || "Logout failed"
      })
  },
});

export const { reset,login,logout } = authSlice.actions;
export default authSlice.reducer;
