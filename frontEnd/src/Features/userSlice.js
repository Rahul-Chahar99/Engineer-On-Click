import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

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
      return rejectWithValue(errorMessage);
    }
  },
);

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
  userInfo: null,
  message: "",
  authStatus: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
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
        state.message = action.payload?.message || "Registration failed";
        state.userInfo = null;
      })
      .addCase(logInUser.pending,(state)=>{
        state.isLoading= true;
      })
      .addCase(logInUser.fulfilled , (state,action)=>{
        state.isLoading= false;
        state.isSuccess= true;
        state.isError = false;
        state.authStatus= true;
        state.userInfo=action.payload.data.user;
        state.message=action.payload?.message || "User LoggedIn Successfully"
      })
      .addCase(logInUser.rejected,(state,action)=>{
        state.isLoading= false;
        state.isError  = true;
        state.isSuccess= false;
        state.authStatus= false;
        state.userInfo= null;
        state.message=action.payload?.message || "User LogIn Failed "
      })
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

export const { reset } = authSlice.actions;
export default authSlice.reducer;
