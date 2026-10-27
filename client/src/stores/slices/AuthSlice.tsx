import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { REHYDRATE } from "redux-persist";
import type { SignUpType } from "../../pages/SignUp";
import type { FormDataType } from "../../pages/SignIn";
import type { RegisterOtherUserType } from "../../pages/RegisterToKitchen";

/* ---------------- TYPES ---------------- */

type AuthState = {
  loading: boolean;
  error: string | null;
  message: string | null;
  user: {
    email?: string;
    username?: string;
  } | null;
  role: string;
  isAuthenticated: boolean;
  kitchenId: string;
  userId: string;
};

const initialState: AuthState = {
  loading: false,
  error: null,
  message: null,
  user: null,
  role: "",
  isAuthenticated: false,
  kitchenId: "",
  userId: "",
};

/* ---------------- API BASE ---------------- */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API = `${API_BASE}/api/auth`;

/* ---------------- THUNKS ---------------- */

// Register (Admin)
export const register = createAsyncThunk(
  "auth/register",
  async (data: SignUpType, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API}/register`, data, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      return rejectWithValue(err.response?.data?.message || "Registration failed");
    }
  }
);

// Register to Kitchen
export const registerToKitchen = createAsyncThunk(
  "auth/registerToKitchen",
  async (data: RegisterOtherUserType, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API}/registerToKitchen`, data, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      return rejectWithValue(err.response?.data?.message || "Registration failed");
    }
  }
);

// Login
export const login = createAsyncThunk(
  "auth/login",
  async (data: FormDataType, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API}/login`, data, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

// ✅ GET CURRENT USER ( /me )
export const getMe = createAsyncThunk(
  "auth/getMe",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API}/me`, {
        withCredentials: true,
      });
      return res.data;
    } catch {
      return rejectWithValue("Session expired");
    }
  }
);

// Logout
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API}/logout`, {}, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      return rejectWithValue(err.response?.data?.message || "Logout failed");
    }
  }
);

/* ---------------- SLICE ---------------- */

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
  },

  extraReducers: (builder) => {
    /* ---------- REHYDRATE (Redux Persist) ---------- */
    builder
      .addCase(REHYDRATE, (state) => {
        state.loading = false;
        state.error = null;
        state.message = null;
      });

    /* ---------- REGISTER ---------- */
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.message = action.payload.message;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.message = null;
        state.error = action.payload as string;
      });

    /* ---------- REGISTER TO KITCHEN ---------- */
    builder
      .addCase(registerToKitchen.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(registerToKitchen.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.message = action.payload.message;
      })
      .addCase(registerToKitchen.rejected, (state, action) => {
        state.loading = false;
        state.message = null;
        state.error = action.payload as string;
      });

    /* ---------- LOGIN ---------- */
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.message = action.payload.message;
        state.role = action.payload.role;
        state.kitchenId = action.payload.kitchenId;
        state.userId = action.payload.id || action.payload.userId;
        state.user = {
          email: action.payload.email,
          username: action.payload.name || action.payload.userName,
        };
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.message = null;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    /* ---------- GET ME (SESSION VALIDATION) ---------- */
    builder
      .addCase(getMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.error = null;
        state.message = null;
        state.user = {
          email: action.payload.email,
          username: action.payload.username,
        };
        state.role = action.payload.role;
        state.kitchenId = action.payload.kitchenId;
        state.userId = action.payload.userId;
      })
      .addCase(getMe.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.role = "";
        state.kitchenId = "";
        state.userId = "";
        state.error = null;
        state.message = null;
      });

    /* ---------- LOGOUT ---------- */
    builder
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.role = "";
        state.kitchenId = "";
        state.userId = "";
        state.message = null;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.message = null;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearMessage } = authSlice.actions;
export default authSlice.reducer;